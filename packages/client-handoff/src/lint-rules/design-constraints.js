/**
 * @module @sard/client-handoff/lint-rules/design-constraints
 * ESLint rule: No hex colors outside design tokens
 * Enforces HC-11 Client Handoff Layer 1: Design constraints
 */

const { ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator(name => `${name}`);

module.exports = createRule({
  name: 'no-hardcoded-colors',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded color values outside design tokens',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noHexColor: 'Hardcoded hex color "{{color}}" is not allowed. Use design tokens from @sard/design-tokens instead.',
      noRgbColor: 'Hardcoded RGB color "{{color}}" is not allowed. Use design tokens from @sard/design-tokens instead.',
      noHslColor: 'Hardcoded HSL color "{{color}}" is not allowed. Use design tokens from @sard/design-tokens instead.',
      noNamedColor: 'Hardcoded named color "{{color}}" is not allowed. Use design tokens from @sard/design-tokens instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    // Regex patterns for various color formats
    const hexColorRegex = /#[0-9a-fA-F]{3,8}/g;
    const rgbColorRegex = /rgba?s*(s*d+s*,s*d+s*,s*d+s*(?:,s*[d.]+)?s*)/g;
    const hslColorRegex = /hsla?s*(s*d+s*,s*d+%s*,s*d+%s*(?:,s*[d.]+)?s*)/g;
    
    // Named colors (excluding transparent, currentColor, inherit, initial, unset)
    const namedColors = new Set([
      'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure',
      'beige', 'bisque', 'black', 'blanchedalmond', 'blue',
      'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse',
      'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson',
      'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray',
      'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen',
      'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen',
      'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise',
      'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey',
      'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia',
      'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green',
      'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred', 'indigo',
      'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon',
      'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray',
      'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen',
      'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue',
      'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon',
      'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple',
      'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
      'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin',
      'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange',
      'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise',
      'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum',
      'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue',
      'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna',
      'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow',
      'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato',
      'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'
    ]);

    // Allowed exceptions
    const allowedPatterns = [
      /transparent/,
      /currentColor/,
      /inherit/,
      /initial/,
      /unset/,
      /var(/,
      /theme(/,
      /color-mix(/,
    ];

    function isAllowed(value) {
      return allowedPatterns.some(pattern => pattern.test(value));
    }

    function checkString(node, value) {
      if (isAllowed(value)) return;

      // Check hex colors
      const hexMatches = value.match(/#[0-9a-fA-F]{3,8}/g);
      if (hexMatches) {
        hexMatches.forEach(match => {
          context.report({
            node,
            messageId: 'noHexColor',
            data: { color: match },
          });
        });
      }

      // Check RGB colors
      const rgbMatches = value.match(/rgba?s*(s*d+s*,s*d+s*,s*d+s*(?:,s*[d.]+)?s*)/g);
      if (rgbMatches) {
        rgbMatches.forEach(match => {
          context.report({
            node,
            messageId: 'noRgbColor',
            data: { color: match },
          });
        });
      }

      // Check HSL colors
      const hslMatches = value.match(/hsla?s*(s*d+s*,s*d+%s*,s*d+%s*(?:,s*[d.]+)?s*)/g);
      if (hslMatches) {
        hslMatches.forEach(match => {
          context.report({
            node,
            messageId: 'noHslColor',
            data: { color: match },
          });
        });
      }

      // Check named colors
      const words = value.toLowerCase().split(/s+/);
      words.forEach(word => {
        if (namedColors.has(word) && !isAllowed(word)) {
          context.report({
            node,
            messageId: 'noNamedColor',
            data: { color: word },
          });
        }
      });
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          checkString(node, node.value);
        }
      },
      TemplateLiteral(node) {
        node.quasis.forEach(quasi => {
          checkString(node, quasi.value.raw);
        });
      },
      JSXAttribute(node) {
        if (node.value && node.value.type === 'Literal' && typeof node.value.value === 'string') {
          checkString(node, node.value.value);
        }
        if (node.value && node.value.type === 'JSXExpressionContainer') {
          // Skip JSX expressions - they might be token references
        }
      },
    };
  },
});
