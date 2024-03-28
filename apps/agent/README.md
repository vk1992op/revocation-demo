# OCM ENGINE - AGENT

Agent service is a wrapper around @ocm-engine/askar library. 

The agent can be started with two different mods - Rest and Consumer, default behaviour is a message consumer.

Agent will consume messages from a broker (NATS) on a pre-configured stream and subjects. 

Then it will do execute the task and send result to the @ocm-engine/gateway.  

## Agent setup

### From the root of the project run:
 

####  Install dependencies     
```
yarn install
```
#### Copy .env.example to .env

```
cp .env.exampe .env
```

Do changes to the .env according to your needs.

#### Start the agent locally:

```
yarn serve:agent
```
