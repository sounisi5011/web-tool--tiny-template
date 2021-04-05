import hbs from 'handlebars';

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
            describe.each<[string | string[], TypeNodeRecord, Array<[unknown, string | string[] | Error]>?]>([
                [
                    '<ul> {{#each people}} nothing {{/each}} </ul>',
                    {
                        people: arrayType(undefType),
                    },
                    [
                        [
                            { people: [null] },
                            `<ul>  nothing  </ul>`,
                        ],
                        [
                            { people: [42, 'foo'] },
                            `<ul>  nothing  nothing  </ul>`,
                        ],
                    ],
                ],
                [
                    '<ul> {{#each people}} <li>{{this}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(stringType),
                    },
                    [
                        [
                            { people: [42, 'foo'] },
                            `<ul>  <li>42</li>  <li>foo</li>  </ul>`,
                        ],
                        [
                            { people: [{ this: 6 }] },
                            `<ul>  <li>[object Object]</li>  </ul>`,
                        ],
                    ],
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
                    [
                        [
                            { data: { people: { list: [42, 'foo'] } } },
                            `<ul>  <li>42</li>  <li>foo</li>  </ul>`,
                        ],
                    ],
                ],
                [
                    '<ul> {{#each people}} <li data-index="{{@index}}" data-key="{{@key}}">{{this}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(stringType),
                    },
                    [
                        [
                            {
                                people: [
                                    42,
                                ],
                            },
                            `<ul>  <li data-index="0" data-key="0">42</li>  </ul>`,
                        ],
                        [
                            {
                                people: [
                                    { '@index': 'in', '@key': 'K' },
                                ],
                            },
                            `<ul>  <li data-index="0" data-key="0">[object Object]</li>  </ul>`,
                        ],
                    ],
                ],
                [
                    '<ul> {{#each people}} <li>{{name}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                        })),
                    },
                    [
                        [
                            { people: [{ name: 'hoge' }] },
                            `<ul>  <li>hoge</li>  </ul>`,
                        ],
                        [
                            { people: ['hoge'] },
                            `<ul>  <li></li>  </ul>`,
                        ],
                    ],
                ],
                [
                    '<ul> {{#each people}} <li>{{name}}</li> {{else}} <li class=else>{{defaultName}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                        })),
                        defaultName: stringType,
                    },
                    [
                        [
                            { people: [{ name: 'hoge', defaultName: '[!!!]' }], defaultName: '[!]' },
                            `<ul>  <li>hoge</li>  </ul>`,
                        ],
                        [
                            { people: [], defaultName: '[!]' },
                            `<ul>  <li class=else>[!]</li>  </ul>`,
                        ],
                        [
                            { people: [{ defaultName: '[!!!]' }], defaultName: '[!]' },
                            `<ul>  <li></li>  </ul>`,
                        ],
                        [
                            { people: [null], defaultName: '[!]' },
                            `<ul>  <li></li>  </ul>`,
                        ],
                    ],
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
                    [
                        [
                            { data: { people: { list: [{ name: 'hoge' }] } } },
                            `<ul>  <li>hoge</li>  </ul>`,
                        ],
                    ],
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} / {{this.desc}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                            desc: stringType,
                        })),
                    },
                    [
                        [
                            { people: [{ name: 'hoge', desc: 'bla bla bla' }] },
                            `<ul>  <li>hoge / bla bla bla</li>  </ul>`,
                        ],
                        [
                            { people: [{ name: 'hoge', this: { desc: 'bla bla bla' }, desc: 'clean!!!' }] },
                            `<ul>  <li>hoge / clean!!!</li>  </ul>`,
                        ],
                    ],
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} / {{this/desc}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                            desc: stringType,
                        })),
                    },
                    [
                        [
                            { people: [{ name: 'hoge', desc: 'bla bla bla' }] },
                            `<ul>  <li>hoge / bla bla bla</li>  </ul>`,
                        ],
                        [
                            { people: [{ name: 'hoge', this: { desc: 'bla bla bla' }, desc: 'clean!!!' }] },
                            `<ul>  <li>hoge / clean!!!</li>  </ul>`,
                        ],
                    ],
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} / {{this.this.desc}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                            desc: stringType,
                        })),
                    },
                    [
                        [
                            { people: [{ name: 'hoge', desc: 'bla bla bla' }] },
                            `<ul>  <li>hoge / bla bla bla</li>  </ul>`,
                        ],
                        [
                            {
                                people: [
                                    {
                                        name: 'hoge',
                                        this: { this: { desc: 'gulp!' }, desc: 'bla bla bla' },
                                        desc: 'clean!!!',
                                    },
                                ],
                            },
                            `<ul>  <li>hoge / clean!!!</li>  </ul>`,
                        ],
                    ],
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} / {{this/this/desc}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                            desc: stringType,
                        })),
                    },
                    [
                        [
                            { people: [{ name: 'hoge', desc: 'bla bla bla' }] },
                            `<ul>  <li>hoge / bla bla bla</li>  </ul>`,
                        ],
                        [
                            {
                                people: [
                                    {
                                        name: 'hoge',
                                        this: { this: { desc: 'gulp!' }, desc: 'bla bla bla' },
                                        desc: 'clean!!!',
                                    },
                                ],
                            },
                            `<ul>  <li>hoge / clean!!!</li>  </ul>`,
                        ],
                    ],
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} / {{this.this/desc}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                            desc: stringType,
                        })),
                    },
                    [
                        [
                            { people: [{ name: 'hoge', desc: 'bla bla bla' }] },
                            `<ul>  <li>hoge / bla bla bla</li>  </ul>`,
                        ],
                        [
                            {
                                people: [
                                    {
                                        name: 'hoge',
                                        this: { this: { desc: 'gulp!' }, desc: 'bla bla bla' },
                                        desc: 'clean!!!',
                                    },
                                ],
                            },
                            `<ul>  <li>hoge / clean!!!</li>  </ul>`,
                        ],
                    ],
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} / {{this/this.desc}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                            desc: stringType,
                        })),
                    },
                    [
                        [
                            { people: [{ name: 'hoge', desc: 'bla bla bla' }] },
                            `<ul>  <li>hoge / bla bla bla</li>  </ul>`,
                        ],
                        [
                            {
                                people: [
                                    {
                                        name: 'hoge',
                                        this: { this: { desc: 'gulp!' }, desc: 'bla bla bla' },
                                        desc: 'clean!!!',
                                    },
                                ],
                            },
                            `<ul>  <li>hoge / clean!!!</li>  </ul>`,
                        ],
                    ],
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} / {{this.this/this.desc}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                            desc: stringType,
                        })),
                    },
                    [
                        [
                            { people: [{ name: 'hoge', desc: 'bla bla bla' }] },
                            `<ul>  <li>hoge / bla bla bla</li>  </ul>`,
                        ],
                        [
                            {
                                people: [
                                    {
                                        name: 'hoge',
                                        this: { this: { this: { desc: '!#?$' }, desc: 'gulp!' }, desc: 'bla bla bla' },
                                        desc: 'clean!!!',
                                    },
                                ],
                            },
                            `<ul>  <li>hoge / clean!!!</li>  </ul>`,
                        ],
                    ],
                ],
                [
                    '<ul> {{#each people}} <li>{{name}} / {{this/this.this/desc}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                            desc: stringType,
                        })),
                    },
                    [
                        [
                            { people: [{ name: 'hoge', desc: 'bla bla bla' }] },
                            `<ul>  <li>hoge / bla bla bla</li>  </ul>`,
                        ],
                        [
                            {
                                people: [
                                    {
                                        name: 'hoge',
                                        this: { this: { this: { desc: '!#?$' }, desc: 'gulp!' }, desc: 'bla bla bla' },
                                        desc: 'clean!!!',
                                    },
                                ],
                            },
                            `<ul>  <li>hoge / clean!!!</li>  </ul>`,
                        ],
                    ],
                ],
                [
                    '<ul> {{#each people}} <li data-index="{{@index}}" data-key="{{@key}}">{{name}}</li> {{/each}} </ul>',
                    {
                        people: arrayType(recordType({
                            name: stringType,
                        })),
                    },
                    [
                        [
                            {
                                people: [
                                    { name: 'hoge' },
                                ],
                            },
                            `<ul>  <li data-index="0" data-key="0">hoge</li>  </ul>`,
                        ],
                        [
                            {
                                people: [
                                    { name: 'fuga', '@index': 'in', '@key': 'K' },
                                ],
                            },
                            `<ul>  <li data-index="0" data-key="0">fuga</li>  </ul>`,
                        ],
                    ],
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
                    [
                        [
                            {
                                people: [
                                    { name: 'hoge', this: '[@]' },
                                ],
                            },
                            `<ul>  <li>hoge <pre>[object Object]</pre></li>  </ul>`,
                        ],
                        [
                            {
                                people: [
                                    42,
                                ],
                            },
                            `<ul>  <li> <pre>42</pre></li>  </ul>`,
                        ],
                    ],
                ],
                [
                    '<dl> {{#each data}} <dt>{{title}}</dt> <dd>{{desc}}</dd> {{/each}} </dl>',
                    {
                        data: arrayType(recordType({
                            title: stringType,
                            desc: stringType,
                        })),
                    },
                    [
                        [
                            {
                                data: [
                                    { title: 'ズンドコベロンチョ', desc: 'え？知らないの？？？' },
                                ],
                            },
                            `<dl>  <dt>ズンドコベロンチョ</dt> <dd>え？知らないの？？？</dd>  </dl>`,
                        ],
                    ],
                ],
                [
                    '{{#each foo this_param_is_invalid}} {{hoge}} {{/each}}',
                    {
                        foo: arrayType(recordType({
                            hoge: stringType,
                        })),
                    },
                    [
                        [
                            { foo: { hoge: 42 } },
                            new Error('Must pass iterator to #each'),
                        ],
                    ],
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
                    [
                        [
                            {
                                foo: [
                                    {
                                        bar: [
                                            { hoge: 42, default: '[/foo/*/bar/*/]' },
                                        ],
                                        default: '[/foo/*/]',
                                    },
                                ],
                                default: '[/]',
                            },
                            `  42  `,
                        ],
                        [
                            {
                                foo: [
                                    {
                                        bar: [],
                                        default: '[/foo/*/]',
                                    },
                                ],
                                default: '[/]',
                            },
                            `  [/foo/*/]  `,
                        ],
                    ],
                ],
                /**
                 * @see https://handlebarsjs.com/guide/block-helpers.html#block-parameters
                 */
                [
                    '{{#each users as |user userId|}} Id: {{userId}} Name: {{user}} {{/each}}',
                    {
                        users: arrayType(stringType),
                    },
                    [
                        [
                            { users: [42], userId: -1 },
                            ` Id: 0 Name: 42 `,
                        ],
                        [
                            { users: [{ user: 42, userId: 'IIU' }], userId: -1 },
                            ` Id: 0 Name: [object Object] `,
                        ],
                    ],
                ],
                [
                    '{{#each users as |user|}} nothing {{/each}}',
                    {
                        users: arrayType(undefType),
                    },
                ],
                [
                    '{{#each users as |user|}} {{hoge}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            hoge: stringType,
                        })),
                    },
                    [
                        [
                            {
                                users: [1],
                                hoge: -1,
                            },
                            `  `,
                        ],
                        [
                            {
                                users: [{}],
                                hoge: -1,
                            },
                            `  `,
                        ],
                        [
                            {
                                users: [{ hoge: -2 }],
                            },
                            ` -2 `,
                        ],
                        [
                            {
                                users: [{ hoge: -2 }],
                                hoge: -1,
                            },
                            ` -2 `,
                        ],
                        [
                            {
                                users: [{ user: { hoge: -3 } }],
                                hoge: -1,
                            },
                            `  `,
                        ],
                        [
                            {
                                users: [{ user: { hoge: -3 }, hoge: -2 }],
                                hoge: -1,
                            },
                            ` -2 `,
                        ],
                    ],
                ],
                [
                    '{{#each users as |user|}} Name: {{user}} {{/each}}',
                    {
                        users: arrayType(stringType),
                    },
                    [
                        [
                            {
                                users: [1],
                            },
                            ` Name: 1 `,
                        ],
                        [
                            {
                                users: [{ user: 6 }],
                            },
                            ` Name: [object Object] `,
                        ],
                    ],
                ],
                [
                    '{{#each users as |user|}} Name: {{user}} {{else}} {{default}} {{/each}}',
                    {
                        users: arrayType(stringType),
                        default: stringType,
                    },
                    [
                        [
                            {
                                users: [42],
                                default: 'Anonymous',
                            },
                            ` Name: 42 `,
                        ],
                        [
                            {
                                users: [{ user: 42 }],
                                default: 'Anonymous',
                            },
                            ` Name: [object Object] `,
                        ],
                        [
                            {
                                users: [],
                                default: 'Anonymous',
                            },
                            ` Anonymous `,
                        ],
                    ],
                ],
                [
                    '{{#each users as |user|}} Name: {{this}} {{/each}}',
                    {
                        users: arrayType(stringType),
                    },
                    [
                        [
                            {
                                users: [42],
                            },
                            ` Name: 42 `,
                        ],
                        [
                            {
                                users: [{ user: 42 }],
                            },
                            ` Name: [object Object] `,
                        ],
                    ],
                ],
                [
                    '{{#each users as |user|}} Name: {{user}} {{hoge}} {{/each}}',
                    {
                        users: arrayType(unionType([
                            stringType,
                            recordType({
                                hoge: stringType,
                            }),
                        ])),
                    },
                    [
                        [
                            {
                                users: [42],
                                hoge: -1,
                            },
                            ` Name: 42  `,
                        ],
                        [
                            {
                                users: [{ user: 42 }],
                                hoge: -1,
                            },
                            ` Name: [object Object]  `,
                        ],
                        [
                            {
                                users: [{ user: 42, hoge: -2 }],
                                hoge: -1,
                            },
                            ` Name: [object Object] -2 `,
                        ],
                    ],
                ],
                [
                    '{{#each users as |user|}} Name: {{this}} {{hoge}} {{/each}}',
                    {
                        users: arrayType(unionType([
                            stringType,
                            recordType({
                                hoge: stringType,
                            }),
                        ])),
                    },
                    [
                        [
                            {
                                users: [42],
                                hoge: -1,
                            },
                            ` Name: 42  `,
                        ],
                        [
                            {
                                users: [{ user: 42 }],
                                hoge: -1,
                            },
                            ` Name: [object Object]  `,
                        ],
                        [
                            {
                                users: [{ user: 42, hoge: -2 }],
                                hoge: -1,
                            },
                            ` Name: [object Object] -2 `,
                        ],
                    ],
                ],
                [
                    '{{#each users as |user userId|}} Id: {{userId}} Name: {{user.name}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            name: stringType,
                        })),
                    },
                    [
                        [
                            {
                                users: [42],
                            },
                            ` Id: 0 Name:  `,
                        ],
                        [
                            {
                                users: [{ name: 'hoge' }],
                            },
                            ` Id: 0 Name: hoge `,
                        ],
                    ],
                ],
                [
                    '{{#each users as |user|}} Id: {{user.id}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            id: stringType,
                        })),
                    },
                    [
                        [
                            {
                                users: [42],
                            },
                            ` Id:  `,
                        ],
                        [
                            {
                                users: [{ id: 42 }],
                            },
                            ` Id: 42 `,
                        ],
                    ],
                ],
                [
                    '{{#each users as |user|}} Id: {{this.id}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            id: stringType,
                        })),
                    },
                    [
                        [
                            {
                                users: [42],
                            },
                            ` Id:  `,
                        ],
                        [
                            {
                                users: [{ id: 42 }],
                            },
                            ` Id: 42 `,
                        ],
                    ],
                ],
                [
                    '{{#each users as |user|}} Id: {{user.id}} {{hoge}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            id: stringType,
                            hoge: stringType,
                        })),
                    },
                    [
                        [
                            {
                                users: [42],
                                hoge: -1,
                            },
                            ` Id:   `,
                        ],
                        [
                            {
                                users: [{ id: 42 }],
                                hoge: -1,
                            },
                            ` Id: 42  `,
                        ],
                        [
                            {
                                users: [{ id: 42, hoge: -2 }],
                                hoge: -1,
                            },
                            ` Id: 42 -2 `,
                        ],
                    ],
                ],
                [
                    '{{#each users as |user|}} Id: {{this.id}} {{hoge}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            id: stringType,
                            hoge: stringType,
                        })),
                    },
                    [
                        [
                            {
                                users: [42],
                                hoge: -1,
                            },
                            ` Id:   `,
                        ],
                        [
                            {
                                users: [{ id: 42 }],
                                hoge: -1,
                            },
                            ` Id: 42  `,
                        ],
                        [
                            {
                                users: [{ id: 42, hoge: -2 }],
                                hoge: -1,
                            },
                            ` Id: 42 -2 `,
                        ],
                    ],
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
                    [
                        [
                            {
                                users: [
                                    42,
                                ],
                            },
                            ` Id:  Name: 42 `,
                        ],
                        [
                            {
                                users: [
                                    { id: 42 },
                                ],
                            },
                            ` Id: 42 Name: [object Object] `,
                        ],
                    ],
                ],
                [
                    '{{#each users as |user|}} Id: {{this.id}} Name: {{user}} {{hoge}} {{/each}}',
                    {
                        users: arrayType(unionType([
                            stringType,
                            recordType({
                                id: stringType,
                                hoge: stringType,
                            }),
                        ])),
                    },
                    [
                        [
                            {
                                users: [
                                    42,
                                ],
                                hoge: -1,
                            },
                            ` Id:  Name: 42  `,
                        ],
                        [
                            {
                                users: [
                                    { id: 42 },
                                ],
                                hoge: -1,
                            },
                            ` Id: 42 Name: [object Object]  `,
                        ],
                        [
                            {
                                users: [
                                    { id: 42, hoge: -2 },
                                ],
                                hoge: -1,
                            },
                            ` Id: 42 Name: [object Object] -2 `,
                        ],
                    ],
                ],
                [
                    '{{#each users as |user|}} Id: {{this.id}} Name: {{user.name}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            id: stringType,
                            name: stringType,
                        })),
                    },
                    [
                        [
                            {
                                users: [
                                    { id: 42, name: 'Hoge' },
                                ],
                            },
                            ` Id: 42 Name: Hoge `,
                        ],
                        [
                            {
                                users: [
                                    { this: { id: 6 }, id: 42, name: 'Hoge' },
                                ],
                            },
                            ` Id: 42 Name: Hoge `,
                        ],
                    ],
                ],
                [
                    '{{#each users as |user|}} Id: {{this.id}} Name: {{user.name}} {{hoge}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            id: stringType,
                            name: stringType,
                            hoge: stringType,
                        })),
                    },
                    [
                        [
                            {
                                users: [
                                    { id: 42, name: 'Hoge', hoge: -9 },
                                ],
                                hoge: -1,
                            },
                            ` Id: 42 Name: Hoge -9 `,
                        ],
                        [
                            {
                                users: [
                                    { id: 42, name: 'Hoge' },
                                ],
                                hoge: -1,
                            },
                            ` Id: 42 Name: Hoge  `,
                        ],
                    ],
                ],
                [
                    '{{#each users as |user userId this_param_is_invalid|}} Id: {{userId}} Name: {{user.name}} {{/each}}',
                    {
                        users: arrayType(recordType({
                            name: stringType,
                        })),
                    },
                    [
                        [
                            {
                                users: [
                                    { name: 'Foo' },
                                ],
                            },
                            ` Id: 0 Name: Foo `,
                        ],
                    ],
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
                    [
                        [
                            {
                                user: {
                                    id: 'U-01',
                                },
                                book: {
                                    id: 'B-01',
                                },
                                users: [
                                    {
                                        id: 'U-02',
                                        book: [
                                            {
                                                id: 'B-02',
                                                user: {
                                                    id: 'U-03',
                                                },
                                                book: {
                                                    id: 'B-03',
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                            [
                                `    User Id: U-02 Book Id: B-02`,
                                ``,
                            ],
                        ],
                    ],
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
                    [
                        [
                            {
                                user: {
                                    id: 'U-01',
                                },
                                book: {
                                    id: 'B-01',
                                },
                                errorMsg: 'E-0001',
                                users: [
                                    {
                                        id: 'U-02',
                                        errorMsg: 'E-0002',
                                        book: [
                                            {
                                                id: 'B-02',
                                                errorMsg: 'E-0003',
                                                user: {
                                                    id: 'U-03',
                                                },
                                                book: {
                                                    id: 'B-03',
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                            [
                                `    User Id: U-02 Book Id: B-02`,
                                ``,
                            ],
                        ],
                        [
                            {
                                user: {
                                    id: 'U-01',
                                },
                                book: {
                                    id: 'B-01',
                                },
                                errorMsg: 'E-0001',
                                users: [
                                    {
                                        id: 'U-02',
                                        errorMsg: 'E-0002',
                                        book: [],
                                    },
                                ],
                            },
                            [
                                `    E-0002`,
                                ``,
                            ],
                        ],
                        [
                            {
                                user: {
                                    id: 'U-01',
                                },
                                book: {
                                    id: 'B-01',
                                },
                                errorMsg: 'E-0001',
                                users: [
                                    {
                                        id: 'U-02',
                                        book: [],
                                    },
                                ],
                            },
                            [
                                `    `,
                                ``,
                            ],
                        ],
                    ],
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
                    [
                        [
                            {
                                user: {
                                    id: 'U-01',
                                },
                                book: {
                                    id: 'B-01',
                                },
                                errorMsg: 'E-0001',
                                users: [
                                    {
                                        id: 'U-02',
                                        errorMsg: 'E-0002',
                                        book: [
                                            {
                                                id: 'B-02',
                                                errorMsg: 'E-0003',
                                                user: {
                                                    id: 'U-03',
                                                },
                                                book: {
                                                    id: 'B-03',
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                            [
                                `    User Id: U-02 Book Id: B-02`,
                                ``,
                            ],
                        ],
                        [
                            {
                                user: {
                                    id: 'U-01',
                                },
                                book: {
                                    id: 'B-01',
                                },
                                errorMsg: 'E-0001',
                                users: [
                                    {
                                        id: 'U-02',
                                        errorMsg: 'E-0002',
                                        book: [],
                                    },
                                ],
                            },
                            [
                                `    E-0002`,
                                ``,
                            ],
                        ],
                        [
                            {
                                user: {
                                    id: 'U-01',
                                },
                                book: {
                                    id: 'B-01',
                                },
                                errorMsg: 'E-0001',
                                users: [
                                    {
                                        id: 'U-02',
                                        book: [],
                                    },
                                ],
                            },
                            [
                                `    `,
                                ``,
                            ],
                        ],
                    ],
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
                    [
                        [
                            {
                                user: {
                                    id: 'U-01',
                                },
                                book: {
                                    id: 'B-01',
                                },
                                errorMsg: 'E-0001',
                                users: [
                                    {
                                        id: 'U-02',
                                        errorMsg: 'E-0002',
                                        book: [
                                            {
                                                id: 'B-02',
                                                errorMsg: 'E-0003',
                                                user: {
                                                    id: 'U-03',
                                                },
                                                book: {
                                                    id: 'B-03',
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                            [
                                `    User Id: U-02 Book Id: B-02`,
                                ``,
                            ],
                        ],
                        [
                            {
                                user: {
                                    id: 'U-01',
                                },
                                book: {
                                    id: 'B-01',
                                },
                                errorMsg: 'E-0001',
                                users: [
                                    {
                                        id: 'U-02',
                                        errorMsg: 'E-0002',
                                        book: [],
                                    },
                                ],
                            },
                            [
                                `    E-0002`,
                                ``,
                            ],
                        ],
                        [
                            {
                                user: {
                                    id: 'U-01',
                                },
                                book: {
                                    id: 'B-01',
                                },
                                errorMsg: 'E-0001',
                                users: [
                                    {
                                        id: 'U-02',
                                        book: [],
                                    },
                                ],
                            },
                            [
                                `    `,
                                ``,
                            ],
                        ],
                    ],
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
                    [
                        [
                            {
                                user: {
                                    id: 'U-01',
                                },
                                book: {
                                    id: 'B-01',
                                },
                                users: [
                                    {
                                        id: 'U-02',
                                        book: [
                                            {
                                                id: 'B-02',
                                                user: {
                                                    id: 'U-03',
                                                },
                                                book: {
                                                    id: 'B-03',
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                            [
                                `    User Id: U-02 Book Id: B-02`,
                                ``,
                            ],
                        ],
                    ],
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
                    [
                        [
                            {
                                user: {
                                    id: 'U-01',
                                },
                                book: {
                                    id: 'B-01',
                                },
                                users: [
                                    {
                                        id: 'U-02',
                                        book: [
                                            {
                                                id: 'B-02',
                                                user: {
                                                    id: 'U-03',
                                                },
                                                book: {
                                                    id: 'B-03',
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                            [
                                `    User Id: U-02 Book Id: B-02`,
                                ``,
                            ],
                        ],
                    ],
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
                    [
                        [
                            {
                                user: {
                                    id: 'U-01',
                                },
                                book: {
                                    id: 'B-01',
                                },
                                users: [
                                    {
                                        id: 'U-02',
                                        book: [
                                            {
                                                id: 'B-02',
                                                user: {
                                                    id: 'U-03',
                                                },
                                                book: {
                                                    id: 'B-03',
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                            [
                                `    User Id: U-03 Book Id: B-02`,
                                ``,
                            ],
                        ],
                    ],
                ],
            ])('%s', (templateData, expected, renderTestData) => {
                const template: string = Array.isArray(templateData) ? templateData.join('\n') : templateData;

                it('_', () => {
                    expect(getVariableRecord(template)).toStrictEqual(expected);
                });

                if (renderTestData) {
                    it.each(
                        renderTestData.map(([data, result], index) =>
                            [`render test #${String(index + 1).padStart(2, '0')}`, data, result] as const
                        ),
                    )('%s', (_, data, expected) => {
                        if (expected instanceof Error) {
                            expect(() => hbs.compile(template)(data)).toThrow(expected);
                        } else {
                            expect(hbs.compile(template)(data))
                                .toBe(Array.isArray(expected) ? expected.join('\n') : expected);
                        }
                    });
                }
            });
        });
    });
});