import * as cheerio from 'cheerio';

export async function getRecipeFromBlog(url: string): Promise<string | undefined> {
  // Fetch the URL page
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const wprmRecipeContent = getWprmRecipeContent($);
  if (wprmRecipeContent) {
    console.log('Found WPRM recipe');
    return wprmRecipeContent;
  }
  const jumpToContent = getJumpToRecipeItem($);
  if (jumpToContent) {
    console.log('Found "jump to" content');
    return jumpToContent;
  }

  return parseHtmlAndGetTextContent(html);
}

// Helper functions (you may need to implement these based on your needs and tools/libraries)
function parseHtmlAndGetTextContent(html: string): string | undefined {
  const $ = cheerio.load(html);
  const innerText = $('body').prop('innerText');
  if (innerText) {
    return cleanUpWhitespaceAndTabs(innerText);
  }

  return undefined;
}

// Helper functions (you may need to implement these based on your needs and tools/libraries)
function getWprmRecipeContent($: cheerio.CheerioAPI): string | undefined {
  // Find an element with an ID that starts with "wprm"
  const wprmElement = $('[id^="wprm"]');

  // If such an element exists, return its text content
  if (wprmElement.length) {
    return getInnerText(wprmElement);
  }

  return undefined;
}

function getJumpToRecipeItem($: cheerio.CheerioAPI): string | undefined {
  // Filter a tags with text that matches "jump to recipe" or "go to recipe" case-insensitively
  const jumpToRecipeElements = $('a').filter(function () {
    const text = $(this).text();
    return / to recipe/i.test(text);
  });

  // Iterate through the filtered elements to find one with an href pointing to an ID
  let content;

  jumpToRecipeElements.each(function () {
    const href = $(this).attr('href');
    // Check if href is an ID selector
    if (href && href.startsWith('#')) {
      const targetElement = $(href);
      // If the target element exists
      if (targetElement.length) {
        content = getInnerText(targetElement);
        return false; // Break out of the .each loop
      }
    }
  });

  // Return the content if an element was found, otherwise undefined
  return content;
}

function getInnerText(element: cheerio.Cheerio<cheerio.AnyNode>): string {
  return cleanUpWhitespaceAndTabs(element.text());
}

function cleanUpWhitespaceAndTabs(text: string): string {
  // This will replace multiple newlines with a single newline
  const cleanedNewlines = text.replace(/\n+/g, '\n');

  // This will replace multiple spaces and tabs with a single space
  const cleanedSpacesAndTabs = cleanedNewlines.replace(/[ \t]+/g, ' ');

  return cleanedSpacesAndTabs.trim();
}
