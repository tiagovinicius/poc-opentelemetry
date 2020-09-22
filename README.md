## Dependencies
Install dependencies using NPM in the back and front directories
`npm install`



## Running Example App 
### Run the backend
In backend root directory `/back/` run:

`npm run start`

### Run the frontend
In frontend root directory `/front/` run: 

`npm run start`



## Running the Telemetry
Start the telemetry agent, collector and backend (Zipkin)

In project's root directory run:

`docker-compose up`

Access the telemetry backend at: 

`http://localhost:9411/zipkin/`

## Contributors
@flaviabarreto
@jgmenezes