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
### Dependencies
Start the Tracing backend (Zipkin)

`docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin`

Access it over: 

`http://localhost:9411/zipkin/`


