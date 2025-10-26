# Exercise 2 - Provide LLM tools

Teach an LLM to call real functions and use their results in its responses.

## Steps

1. Build the function
2. Declare the tool to the LLM
3. Provide the declaration when creating the model/session.
4. Modify the loop

## Short exercise

Provide the LLM access to a Weather tool using the same framework:

- Function: `get_weather(location: string, units: "metric"|"imperial") → { temp, conditions, source }`
- Add the tool declaration to the model.
- Update the loop to detect and execute tool calls, then feed results back into context.

Docs: https://www.npmjs.com/package/openmeteo