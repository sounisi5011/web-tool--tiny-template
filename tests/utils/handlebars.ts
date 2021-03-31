import { getVariableRecord, RecordTypeNode, StringTypeNode, TypeNodeRecord } from '../../src/utils/handlebars';

describe('getVariableRecord()', () => {
    const stringType: StringTypeNode = { type: 'string' };
    const recordType = (children: TypeNodeRecord): RecordTypeNode => ({ type: 'record', children });

    it.each<[string, TypeNodeRecord]>([
        ['nothing', {}],
        [
            '{{ foo }}',
            { foo: stringType },
        ],
        [
            '{{ this }}',
            { '': stringType },
        ],
        [
            '{{ foo.bar }}',
            {
                foo: recordType({
                    bar: stringType,
                }),
            },
        ],
        [
            '{{ foo.bar.baz.qux }}',
            {
                foo: recordType({
                    bar: recordType({
                        baz: recordType({
                            qux: stringType,
                        }),
                    }),
                }),
            },
        ],
    ])('%s', (template, expected) => {
        expect(getVariableRecord(template)).toStrictEqual(expected);
    });
});
