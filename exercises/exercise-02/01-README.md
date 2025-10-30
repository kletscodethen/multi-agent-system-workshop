# Exercise 2 - Provide LLM tools - 30 minutes

Teach an LLM to call real functions and use their results in its responses

## Steps

1. Build the function
2. Declare the tool to the LLM
3. Provide the declaration when creating the model/session
4. Modify the loop

## Short exercise ✨

Provide the LLM access to a Weather tool using the same framework:

- Function e.g. `getWeather(location: string)`
- Add the tool declaration to the model
- Update the loop to detect and execute tool calls, then feed results back into context

Interesting packages:

- https://www.npmjs.com/package/openmeteo
- https://www.npmjs.com/package/openweathermap
- https://www.npmjs.com/package/eventbrite
- https://serpapi.com/google-events-api
