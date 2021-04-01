import {
    ArrayTypeNode,
    genUnionTypeNode,
    getVariableRecord,
    mergeTypeNodeRecord,
    RecordTypeNode,
    StringTypeNode,
    TypeNode,
    TypeNodeRecord,
    UndefinedTypeNode,
    UnionTypeNode,
} from '../../src/utils/handlebars';

const stringType: StringTypeNode = { type: 'string' };
const undefType: UndefinedTypeNode = { type: 'undefined' };
const recordType = (children: TypeNodeRecord): RecordTypeNode => ({ type: 'record', children });
const arrayType = (children: TypeNode): ArrayTypeNode => ({ type: 'array', children });
const unionType = (children: UnionTypeNode['children']): UnionTypeNode => ({ type: 'union', children });

describe('genUnionTypeNode()', () => {
    it.each<[readonly TypeNode[], UnionTypeNode]>([
        [
            [],
            unionType({}),
        ],
        [
            [stringType, arrayType(stringType)],
            unionType({
                string: stringType,
                array: arrayType(stringType),
            }),
        ],
        [
            [stringType, unionType({ undefined: undefType })],
            unionType({
                string: stringType,
                undefined: undefType,
            }),
        ],
        [
            [stringType, recordType({ x: unionType({ undefined: undefType }) })],
            unionType({
                string: stringType,
                record: recordType({ x: unionType({ undefined: undefType }) }),
            }),
        ],
    ])('%o', (childNodeList, expected) => {
        expect(genUnionTypeNode(childNodeList)).toStrictEqual(expected);
    });

    it.each<[readonly TypeNode[], string]>([
        [
            [stringType, stringType],
            'The following types are duplicated: string',
        ],
        [
            [undefType, stringType, undefType, stringType],
            'The following types are duplicated: undefined, string',
        ],
    ])('%o', (childNodeList, expected) => {
        expect(() => genUnionTypeNode(childNodeList)).toThrow(new Error(expected));
    });
});

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
        [
            [
                { foo: stringType },
                { foo: undefType },
            ],
            {
                foo: unionType({
                    string: stringType,
                    undefined: undefType,
                }),
            },
        ],
        [
            [
                { foo: recordType({ hoge: stringType }) },
                { foo: unionType({ string: stringType }) },
            ],
            {
                foo: unionType({
                    string: stringType,
                    record: recordType({ hoge: stringType }),
                }),
            },
        ],
        [
            [
                { foo: unionType({ undefined: undefType }) },
                { foo: unionType({ string: stringType }) },
            ],
            {
                foo: unionType({
                    string: stringType,
                    undefined: undefType,
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
        [
            '{{ foo.bar.baz }} {{ foo.bar }}',
            {
                foo: recordType({
                    bar: unionType({
                        record: recordType({
                            baz: stringType,
                        }),
                        string: stringType,
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
                    '<ul> {{#each people}} nothing {{/each}} </ul>',
                    {
                        people: arrayType(undefType),
                    },
                ],
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
                    '<ul> {{#each people}} <li data-index="{{@index}}" data-key="{{@key}}">{{this}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(stringType),
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
                    '<ul> {{#each data.people.list}} <li>{{name}}</li> {{/each}} </ul>',
                    {
                        data: recordType({
                            people: recordType({
                                list: arrayType(recordType({
                                    name: stringType,
                                })),
                            }),
                        }),
                    },
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} / {{this.desc}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                            desc: stringType,
                        })),
                    },
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} / {{this/desc}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                            desc: stringType,
                        })),
                    },
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} / {{this.this.desc}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                            desc: stringType,
                        })),
                    },
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} / {{this/this/desc}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                            desc: stringType,
                        })),
                    },
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} / {{this.this/desc}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                            desc: stringType,
                        })),
                    },
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} / {{this/this.desc}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                            desc: stringType,
                        })),
                    },
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} / {{this.this/this.desc}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                            desc: stringType,
                        })),
                    },
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} / {{this/this.this/desc}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                            desc: stringType,
                        })),
                    },
                ],
                [
                    '<ul> {{#each people}} <li data-index="{{@index}}" data-key="{{@key}}">{{name}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                        })),
                    },
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} <pre>{{this}}</pre></li> {{/each}} </ul>',
                    {
                        people: arrayType(unionType({
                            string: stringType,
                            record: recordType({
                                name: stringType,
                            }),
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
                /**
                 * @see https://handlebarsjs.com/guide/block-helpers.html#block-parameters
                 */
                [
                    '{{#each users as |user userId|}} Id: {{userId}} Name: {{user}} {{/each}}',
                    {
                        users: arrayType(stringType),
                    },
                ],
                [
                    '{{#each users as |user|}} nothing {{/each}}',
                    {
                        users: arrayType(undefType),
                    },
                ],
                [
                    '{{#each users as |user|}} {{this_var_is_non_exists}} {{/each}}',
                    {
                        users: arrayType(undefType),
                    },
                ],
                [
                    '{{#each users as |user|}} Name: {{user}} {{/each}}',
                    {
                        users: arrayType(stringType),
                    },
                ],
                [
                    '{{#each users as |user|}} Name: {{this}} {{/each}}',
                    {
                        users: arrayType(stringType),
                    },
                ],
                [
                    '{{#each users as |user|}} Name: {{user}} {{this_var_is_non_exists}} {{/each}}',
                    {
                        users: arrayType(stringType),
                    },
                ],
                [
                    '{{#each users as |user|}} Name: {{this}} {{this_var_is_non_exists}} {{/each}}',
                    {
                        users: arrayType(stringType),
                    },
                ],
                [
                    '{{#each users as |user userId|}} Id: {{userId}} Name: {{user.name}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            name: stringType,
                        })),
                    },
                ],
                [
                    '{{#each users as |user|}} Id: {{user.id}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            id: stringType,
                        })),
                    },
                ],
                [
                    '{{#each users as |user|}} Id: {{this.id}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            id: stringType,
                        })),
                    },
                ],
                [
                    '{{#each users as |user|}} Id: {{user.id}} {{this_var_is_non_exists}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            id: stringType,
                        })),
                    },
                ],
                [
                    '{{#each users as |user|}} Id: {{this.id}} {{this_var_is_non_exists}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            id: stringType,
                        })),
                    },
                ],
                [
                    '{{#each users as |user|}} Id: {{this.id}} Name: {{user}} {{/each}}',
                    {
                        users: arrayType(unionType({
                            string: stringType,
                            record: recordType({
                                id: stringType,
                            }),
                        })),
                    },
                ],
                [
                    '{{#each users as |user|}} Id: {{this.id}} Name: {{user}} {{this_var_is_non_exists}} {{/each}}',
                    {
                        users: arrayType(unionType({
                            string: stringType,
                            record: recordType({
                                id: stringType,
                            }),
                        })),
                    },
                ],
                [
                    '{{#each users as |user|}} Id: {{this.id}} Name: {{user.name}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            id: stringType,
                            name: stringType,
                        })),
                    },
                ],
                [
                    '{{#each users as |user|}} Id: {{this.id}} Name: {{user.name}} {{this_var_is_non_exists}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            id: stringType,
                            name: stringType,
                        })),
                    },
                ],
                [
                    '{{#each users as |user userId this_param_is_invalid|}} Id: {{userId}} Name: {{user.name}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            name: stringType,
                        })),
                    },
                ],
            ])('%s', (template, expected) => {
                expect(getVariableRecord(template)).toStrictEqual(expected);
            });
        });
    });
});
