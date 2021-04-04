import { getVariableRecord } from '../../../src/utils/handlebars';
import {
    createArrayTypeNode as arrayType,
    createBooleanTypeNode,
    createRecordTypeNode as recordType,
    createStringTypeNode,
    createUndefinedTypeNode,
    createUnionTypeNode as unionType,
    TypeNodeRecord,
} from '../../../src/utils/handlebars/node';

const stringType = createStringTypeNode();
const undefType = createUndefinedTypeNode();
const boolType = createBooleanTypeNode();

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
                    bar: unionType([
                        recordType({
                            baz: stringType,
                        }),
                        stringType,
                    ]),
                }),
            },
        ],
    ])('%s', (template, expected) => {
        expect(getVariableRecord(template)).toStrictEqual(expected);
    });

    describe('built-in helpers', () => {
        /**
         * @see https://handlebarsjs.com/guide/builtin-helpers.html#if
         */
        describe('#if', () => {
            it.each<[string | string[], TypeNodeRecord]>([
                [
                    `{{#if author}} nothing {{/if}}`,
                    {
                        author: boolType,
                    },
                ],
                [
                    `{{#if data.author}} nothing {{/if}}`,
                    {
                        data: recordType({
                            author: boolType,
                        }),
                    },
                ],
                [
                    `{{#if author}} {{firstName}} {{lastName}} {{/if}}`,
                    {
                        author: boolType,
                        firstName: stringType,
                        lastName: stringType,
                    },
                ],
                [
                    `{{#if author}} {{author}} {{/if}}`,
                    {
                        author: unionType([
                            boolType,
                            stringType,
                        ]),
                    },
                ],
                [
                    `{{#if null}} {{author}} {{/if}}`,
                    {
                        author: stringType,
                    },
                ],
                [
                    `{{#if undefined}} {{author}} {{/if}}`,
                    {
                        author: stringType,
                    },
                ],
                [
                    `{{#if true}} {{author}} {{/if}}`,
                    {
                        author: stringType,
                    },
                ],
                [
                    `{{#if false}} {{author}} {{/if}}`,
                    {
                        author: stringType,
                    },
                ],
                [
                    `{{#if 0}} {{author}} {{/if}}`,
                    {
                        author: stringType,
                    },
                ],
                [
                    `{{#if 42}} {{author}} {{/if}}`,
                    {
                        author: stringType,
                    },
                ],
                [
                    `{{#if ''}} {{author}} {{/if}}`,
                    {
                        author: stringType,
                    },
                ],
                [
                    `{{#if 'str'}} {{author}} {{/if}}`,
                    {
                        author: stringType,
                    },
                ],
                [
                    `{{#if author}} {{name}} {{#if hasBirthday}} {{birthday}} {{/if}} {{/if}}`,
                    {
                        author: boolType,
                        name: stringType,
                        hasBirthday: boolType,
                        birthday: stringType,
                    },
                ],
                [
                    `{{#if author}} nothing {{else}} nothing {{/if}}`,
                    {
                        author: boolType,
                    },
                ],
                [
                    `{{#if author}} nothing {{else}} {{defaultName}} {{/if}}`,
                    {
                        author: boolType,
                        defaultName: stringType,
                    },
                ],
                [
                    `{{#if author}} {{firstName}} {{lastName}} {{else}} {{defaultName}} {{/if}}`,
                    {
                        author: boolType,
                        firstName: stringType,
                        lastName: stringType,
                        defaultName: stringType,
                    },
                ],
                [
                    `{{#if author}} {{firstName}} {{lastName}} {{else}} {{author}} {{/if}}`,
                    {
                        author: unionType([
                            boolType,
                            stringType,
                        ]),
                        firstName: stringType,
                        lastName: stringType,
                    },
                ],
                /**
                 * @see https://handlebarsjs.com/guide/block-helpers.html#conditionals
                 */
                [
                    `{{#if isActive}} nothing {{else if isInactive}} nothing {{/if}}`,
                    {
                        isActive: boolType,
                        isInactive: boolType,
                    },
                ],
                [
                    `{{#if isActive}} {{foo}} {{else if isInactive}} {{bar}} {{else}} {{baz}} {{/if}}`,
                    {
                        isActive: boolType,
                        foo: stringType,
                        isInactive: boolType,
                        bar: stringType,
                        baz: stringType,
                    },
                ],
            ])('%s', (templateData, expected) => {
                const template: string = Array.isArray(templateData) ? templateData.join('\n') : templateData;
                expect(getVariableRecord(template)).toStrictEqual(expected);
            });
        });
        /**
         * @see https://handlebarsjs.com/guide/builtin-helpers.html#unless
         */
        describe('#unless', () => {
            it.each<[string | string[], TypeNodeRecord]>([
                [
                    `{{#unless author}} nothing {{/unless}}`,
                    {
                        author: boolType,
                    },
                ],
                [
                    `{{#unless author}} {{firstName}} {{lastName}} {{/unless}}`,
                    {
                        author: boolType,
                        firstName: stringType,
                        lastName: stringType,
                    },
                ],
                [
                    `{{#unless author}} {{author}} {{/unless}}`,
                    {
                        author: unionType([
                            boolType,
                            stringType,
                        ]),
                    },
                ],
                [
                    `{{#unless author}} nothing {{else}} nothing {{/unless}}`,
                    {
                        author: boolType,
                    },
                ],
                [
                    `{{#unless author}} nothing {{else}} {{defaultName}} {{/unless}}`,
                    {
                        author: boolType,
                        defaultName: stringType,
                    },
                ],
                [
                    `{{#unless author}} {{firstName}} {{lastName}} {{else}} {{defaultName}} {{/unless}}`,
                    {
                        author: boolType,
                        firstName: stringType,
                        lastName: stringType,
                        defaultName: stringType,
                    },
                ],
                [
                    `{{#unless author}} {{firstName}} {{lastName}} {{else}} {{author}} {{/unless}}`,
                    {
                        author: unionType([
                            boolType,
                            stringType,
                        ]),
                        firstName: stringType,
                        lastName: stringType,
                    },
                ],
            ])('%s', (templateData, expected) => {
                const template: string = Array.isArray(templateData) ? templateData.join('\n') : templateData;
                expect(getVariableRecord(template)).toStrictEqual(expected);
            });
        });
        /**
         * @see https://handlebarsjs.com/guide/builtin-helpers.html#each
         */
        describe('#each', () => {
            it.each<[string | string[], TypeNodeRecord]>([
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
                    '<ul> {{#each people}} <li>{{name}}</li> {{else}} <li>{{defaultName}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                        })),
                        defaultName: stringType,
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
                        people: arrayType(unionType([
                            stringType,
                            recordType({
                                name: stringType,
                            }),
                        ])),
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
                [
                    '{{#each foo}} {{#each bar}} {{hoge}} {{else}} {{default}} {{/each}} {{/each}}',
                    {
                        foo: arrayType(recordType({
                            bar: arrayType(recordType({
                                hoge: stringType,
                            })),
                            default: stringType,
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
                    '{{#each users as |user|}} Name: {{user}} {{else}} {{default}} {{/each}}',
                    {
                        users: arrayType(stringType),
                        default: stringType,
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
                        users: arrayType(unionType([
                            stringType,
                            recordType({
                                id: stringType,
                            }),
                        ])),
                    },
                ],
                [
                    '{{#each users as |user|}} Id: {{this.id}} Name: {{user}} {{this_var_is_non_exists}} {{/each}}',
                    {
                        users: arrayType(unionType([
                            stringType,
                            recordType({
                                id: stringType,
                            }),
                        ])),
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
                [
                    [
                        `{{#each users as |user|}}`,
                        `  {{#each user.book as |book|}}`,
                        `    User Id: {{user.id}} Book Id: {{book.id}}`,
                        `  {{/each}}`,
                        `{{/each}}`,
                    ],
                    {
                        users: arrayType(recordType({
                            id: stringType,
                            book: arrayType(recordType({
                                id: stringType,
                            })),
                        })),
                    },
                ],
                [
                    [
                        `{{#each users as |user|}}`,
                        `  {{#each user.book as |book|}}`,
                        `    User Id: {{user.id}} Book Id: {{book.id}}`,
                        `  {{else}}`,
                        `    {{errorMsg}}`,
                        `  {{/each}}`,
                        `{{/each}}`,
                    ],
                    {
                        users: arrayType(recordType({
                            id: stringType,
                            book: arrayType(recordType({
                                id: stringType,
                            })),
                            errorMsg: stringType,
                        })),
                    },
                ],
                [
                    [
                        `{{#each users as |user|}}`,
                        `  {{#each user.book as |book|}}`,
                        `    User Id: {{user.id}} Book Id: {{book.id}}`,
                        `  {{else}}`,
                        `    {{user.errorMsg}}`,
                        `  {{/each}}`,
                        `{{/each}}`,
                    ],
                    {
                        users: arrayType(recordType({
                            id: stringType,
                            book: arrayType(recordType({
                                id: stringType,
                            })),
                            errorMsg: stringType,
                        })),
                    },
                ],
                [
                    [
                        `{{#each users as |user|}}`,
                        `  {{#each user.book as |book|}}`,
                        `    User Id: {{user.id}} Book Id: {{book.id}}`,
                        `  {{else}}`,
                        `    {{this.errorMsg}}`,
                        `  {{/each}}`,
                        `{{/each}}`,
                    ],
                    {
                        users: arrayType(recordType({
                            id: stringType,
                            book: arrayType(recordType({
                                id: stringType,
                            })),
                            errorMsg: stringType,
                        })),
                    },
                ],
                [
                    [
                        `{{#each users as |user|}}`,
                        `  {{#each user.book}}`,
                        `    User Id: {{user.id}} Book Id: {{this.id}}`,
                        `  {{/each}}`,
                        `{{/each}}`,
                    ],
                    {
                        users: arrayType(recordType({
                            id: stringType,
                            book: arrayType(recordType({
                                id: stringType,
                            })),
                        })),
                    },
                ],
                [
                    [
                        `{{#each users as |user|}}`,
                        `  {{#each user.book}}`,
                        `    User Id: {{user.id}} Book Id: {{id}}`,
                        `  {{/each}}`,
                        `{{/each}}`,
                    ],
                    {
                        users: arrayType(recordType({
                            id: stringType,
                            book: arrayType(recordType({
                                id: stringType,
                            })),
                        })),
                    },
                ],
                [
                    [
                        `{{#each users as |user|}}`,
                        `  {{#each user.book}}`,
                        `    User Id: {{this.user.id}} Book Id: {{id}}`,
                        `  {{/each}}`,
                        `{{/each}}`,
                    ],
                    {
                        users: arrayType(recordType({
                            book: arrayType(recordType({
                                user: recordType({
                                    id: stringType,
                                }),
                                id: stringType,
                            })),
                        })),
                    },
                ],
            ])('%s', (templateData, expected) => {
                const template: string = Array.isArray(templateData) ? templateData.join('\n') : templateData;
                expect(getVariableRecord(template)).toStrictEqual(expected);
            });
        });
    });
});
