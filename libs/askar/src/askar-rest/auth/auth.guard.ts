import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";
import { IConfAgent } from "@ocm-engine/config";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger: Logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config: IConfAgent = this.configService.get<IConfAgent>("agent")!;

    if (!(config.agentAuthBasicEnabled || config.agentAuthJwtEnabled)) {
      return true;
    }
    // Auth enabled

    const request = context.switchToHttp().getRequest();
    const [type, token] = this.extractAuthHeader(request);
    if (!type || !token) {
      throw new UnauthorizedException();
    }

    switch (type) {
      case "Bearer":
        if (!config.agentAuthJwtEnabled) throw new UnauthorizedException();
        await this.verifyBearerToken(token, config);
        break;
      case "Basic":
        if (!config.agentAuthBasicEnabled) throw new UnauthorizedException();
        await this.verifyBasicToken(token, config);
        break;
      default:
        throw new UnauthorizedException();
    }

    return true;
  }

  private async verifyBearerToken(token: string, config: IConfAgent) {
    try {
      await this.jwtService.verifyAsync(token, {
        publicKey: config.agentAuthJwtPublicKey,
      });
    } catch (e) {
      this.logger.log("Token verification Error");
      this.logger.log(e);
      throw new UnauthorizedException();
    }
  }

  private async verifyBasicToken(token: string, config: IConfAgent) {
    const [username, password] = Buffer.from(token, "base64")
      .toString()
      .split(":");

    if (
      username !== config.agentAuthBasicUser ||
      password !== config.agentAuthBasicPass
    ) {
      throw new UnauthorizedException();
    }
  }

  private extractAuthHeader(
    request: Request,
  ): [string | undefined, string | undefined] {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return [type, token];
  }
}
