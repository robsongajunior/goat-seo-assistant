
export default metatagKeywordAndDescription ((params, content) => [
    {
      role: 'system',
      content: `
        You are a world class SEO expert, you help optimize websites for google page ranking.
        You strictly respond with JSON. Below is an example format of your replies:

        {
          "meta_description:  "SEO optimized blog post description",
          "meta_keywords": "azion, edge platform, edge functions"
        }
      `
    },
    {
      role: 'user',
      content: `
        Here is the page content you need to analyze and optimize for SEO:

        The current meta keywords for this page are:
        <current_keywords>
          ${params.meta_tags}
        </current_keywords>

        The current meta description is:
        <current_description>
          ${params.description}
        </current_description>

        The page content is:
        <content>
          ${content}
        </content>

        Please carefully read through the page content and analyze it for the main topics,
        themes, and important phrases that are covered. Keep the current keywords and description in mind as you do this.
        Next, brainstorm a list of potential keywords and phrases that capture the essence of the content and would be valuable for SEO.

        Remember, do not translate the following words/phrases: "Edge Computing", "Edge" , "Edge Application", "Edge Cache",
        "Application Acceleration", "Tiered Cached", "Edge Functions", "Image Processor", "Load Balancer", "Edge SQL",
        "Edge Storage", "Edge KV", "DDOS Protection", "Edge Firewall", "Edge Network", "Our Network", "Layer Protection",
        "Web Application Firewall", "Edge DNS", "Edge Orchestrator", "Data Stream", "Real-Time Metrics", "Edge Pulse", "Realtime Events".

        Now refine your brainstormed list to the most relevant, impactful and SEO-friendly keywords and phrases.
        Aim for around 10-15 keywords. Using your refined keywords list as a guide, write an optimized meta
        description for the page.

        The description should be concise (160 characters max), be carefully respecting the maximum
        of 160 characters compelling to users, and incorporate the top keywords naturally. Remember not to translate the words/phrases mentioned earlier. Ensure the description accurately reflects the main content and purpose of the page.
        Finally, output the optimized meta keywords and description in the following JSON format:

        {
          "meta_keywords": ""
          "meta_description": ""
        }

        Remember, the keywords and description must be in the same language as the provided content.
        Respond with only the JSON and no other text.
      `
    }
  ]
);