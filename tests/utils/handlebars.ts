import {
    getVariableRecord,
    mergeTypeNodeRecord,
    RecordTypeNode,
    StringTypeNode,
    TypeNodeRecord,
} from '../../src/utils/handlebars';

const stringType: StringTypeNode = { type: 'string' };
const recordType = (children: TypeNodeRecord): RecordTypeNode => ({ type: 'record', children });

describe('mergeTypeNodeRecord()', () => {
    it.each<[readonly TypeNodeRecord[], TypeNodeRecord]>([
        [
            [
                { foo: recordType({ hoge: stringType }) },
                { foo: recordType({ fuga: stringType }) },
            ],
            {
                foo: recordType({
                    hoge: stringType,
                    fuga: stringType,
                }),
            },
        ],
        [
            [
                { hoge: recordType({ foo: stringType }) },
                { fuga: recordType({ bar: stringType }) },
                { hoge: recordType({ baz: stringType }) },
                { fuga: recordType({ qux: stringType }) },
                { hoge: recordType({ quux: stringType }) },
            ],
            {
                hoge: recordType({
                    foo: stringType,
                    baz: stringType,
                    quux: stringType,
                }),
                fuga: recordType({
                    bar: stringType,
                    qux: stringType,
                }),
            },
        ],
    ])('%o', (sources, expected) => {
        expect(mergeTypeNodeRecord(...sources)).toStrictEqual(expected);
    });
});

describe('getVariableRecord()', () => {
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
        [
            '{{ foo }} {{ bar }}',
            {
                foo: stringType,
                bar: stringType,
            },
        ],
        [
            '{{ foo.hoge }} {{ foo.fuga }}',
            {
                foo: recordType({
                    hoge: stringType,
                    fuga: stringType,
                }),
            },
        ],
        [
            '{{ foo.hoge.あ }} {{ foo.hoge.い }}',
            {
                foo: recordType({
                    hoge: recordType({
                        あ: stringType,
                        い: stringType,
                    }),
                }),
            },
        ],
    ])('%s', (template, expected) => {
        expect(getVariableRecord(template)).toStrictEqual(expected);
    });
});
