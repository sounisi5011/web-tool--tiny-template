import {
    ArrayTypeNode,
    getVariableRecord,
    mergeTypeNodeRecord,
    RecordTypeNode,
    StringTypeNode,
    TypeNode,
    TypeNodeRecord,
} from '../../src/utils/handlebars';

const stringType: StringTypeNode = { type: 'string' };
const recordType = (children: TypeNodeRecord): RecordTypeNode => ({ type: 'record', children });
const arrayType = (children: TypeNode): ArrayTypeNode => ({ type: 'array', children });

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

    describe('built-in helpers', () => {
        /**
         * @see https://handlebarsjs.com/guide/builtin-helpers.html#each
         */
        describe('#each', () => {
            it.each<[string, TypeNodeRecord]>([
                [
                    '<ul> {{#each people}} <li>{{this}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(stringType),
                    },
                ],
                [
                    '<ul> {{#each data.people.list}} <li>{{this}}</li> {{/each}} </ul>',
                    {
                        data: recordType({
                            people: recordType({
                                list: arrayType(stringType),
                            }),
                        }),
                    },
                ],
                [
                    '<ul> {{#each people}} <li>{{name}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                        })),
                    },
                ],
                [
                    '<dl> {{#each data}} <dt>{{title}}</dt> <dd>{{desc}}</dd> {{/each}} </dl>',
                    {
                        data: arrayType(recordType({
                            title: stringType,
                            desc: stringType,
                        })),
                    },
                ],
                [
                    '{{#each foo this_param_is_invalid}} {{hoge}} {{/each}}',
                    {
                        foo: arrayType(recordType({
                            hoge: stringType,
                        })),
                    },
                ],
            ])('%s', (template, expected) => {
                expect(getVariableRecord(template)).toStrictEqual(expected);
            });
        });
    });
});
