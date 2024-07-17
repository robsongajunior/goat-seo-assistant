import OpenAI from 'openai';

//////////////////
// OPEN IA API //
////////////////

// in the terminal exec the command to export the the OPENAI_API_KEY variable
// export OPENAI_API_KEY="[openia_apikey]"
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


////////////////
// FUNCTIONS //
//////////////

async function suggestion({ model, messages, response_format }) {
  const completion = await client.chat.completions.create({ model, messages, response_format });
  const suggestion = completion.choices[0];

  return suggestion;
};

async function getSuggestion(messages) {
  const response =  await suggestion({
    model: "gpt-4-turbo",
    messages: messages,
    response_format: {
      type: "json_object"
    }
  });

  return response;
};


/////////////////////
// DEFAULT EXPORTS //
/////////////////////

export default {
  getSuggestion
}
