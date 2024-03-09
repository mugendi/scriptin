import { camelToKebab } from './parsers';


export default function toCss(json) {
  var output ='';

  for (let selector in json) {
    if (json.hasOwnProperty(selector)) {
      output += selector + ' {\n';
      for (let style in json[selector]) {
        if (json[selector].hasOwnProperty(style)) {
          output += camelToKebab(style) + ': ' + json[selector][style] + ';\n';
        }
      }
      output += '}\n';
    }
  }

  return output
}
