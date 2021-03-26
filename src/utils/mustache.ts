import Mustache from 'mustache';

type TemplateSpans = ReturnType<typeof Mustache['parse']>;

function getVariableNameListFromTemplateSpans(templateSpans: TemplateSpans): string[] {
    return templateSpans
        .reduce<string[]>((variableNameList, [type, value, _startIndex, _endIndex, subTokens]) => {
            if (type === 'name' || type === '&' || type === '#' || type === '^') {
                variableNameList.push(value.replace(/\s*\..+$/, ''));
            }
            if (Array.isArray(subTokens)) {
                variableNameList.push(...getVariableNameListFromTemplateSpans(subTokens));
            }
            return variableNameList;
        }, []);
}

export function getVariableNameList(template: string): string[] {
    const templateSpans = Mustache.parse(template);
    return getVariableNameListFromTemplateSpans(templateSpans);
}
