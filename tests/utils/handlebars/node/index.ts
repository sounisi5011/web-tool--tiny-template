import {
    ArrayTypeNode,
    BooleanTypeNode,
    createArrayTypeNode,
    createBooleanTypeNode,
    createEmptyTypeNode,
    createPrimitiveTypeNode,
    createRecordTypeNode,
    createStringTypeNode,
    createUndefinedTypeNode,
    createUnionTypeNode,
    getTypeNodeByTypeName,
    mergeTypeNode,
    RecordTypeNode,
    StringTypeNode,
    TypeNode,
    TypeNodeRecord,
    UndefinedTypeNode,
    UnionTypeNode,
} from '../../../../src/utils/handlebars/node';

/* eslint-disable jest/require-top-level-describe */

const undefType: UndefinedTypeNode = { type: 'undefined' };
const stringType: StringTypeNode = { type: 'string' };
const boolType: BooleanTypeNode = { type: 'boolean' };
const arrayType = (children: TypeNode): ArrayTypeNode => ({ type: 'array', children });
const recordType = (children: TypeNodeRecord): RecordTypeNode => ({ type: 'record', children });
const unionType = (children: UnionTypeNode['children']): UnionTypeNode => ({ type: 'union', children });

const printTypeNode = (node: TypeNode): string => {
    if (node.type === 'array') {
        return `array<${printTypeNode(node.children)}>`;
    }
    if (node.type === 'record') {
        return `record<${
            Object.entries(node.children)
                .map(([prop, childNode]) => `${prop}=${printTypeNode(childNode)}`)
                .join(', ')
        }>`;
    }
    if (node.type === 'union') {
        return `union<${
            Object.values(node.children)
                .filter((v): v is Exclude<typeof v, undefined> => v !== undefined)
                .map(printTypeNode)
                .join(', ')
        }>`;
    }
    return node.type;
};

describe('createPrimitiveTypeNode()', () => {
    it('type:undefined', () => {
        const node: UndefinedTypeNode = createPrimitiveTypeNode('undefined');
        expect(node).toStrictEqual(undefType);
    });

    it('type:boolean', () => {
        const node: BooleanTypeNode = createPrimitiveTypeNode('boolean');
        expect(node).toStrictEqual(boolType);
    });

    it('type:string', () => {
        const node: StringTypeNode = createPrimitiveTypeNode('string');
        expect(node).toStrictEqual(stringType);
    });
});

test('createUndefinedTypeNode()', () => {
    const node: UndefinedTypeNode = createUndefinedTypeNode();
    expect(node).toStrictEqual(undefType);
});

test('createBooleanTypeNode()', () => {
    const node: BooleanTypeNode = createBooleanTypeNode();
    expect(node).toStrictEqual(boolType);
});

test('createStringTypeNode()', () => {
    const node: StringTypeNode = createStringTypeNode();
    expect(node).toStrictEqual(stringType);
});

describe('createRecordTypeNode()', () => {
    it('empty children', () => {
        const node: RecordTypeNode = createRecordTypeNode({});
        expect(node).toStrictEqual(recordType({}));
    });
});

describe('createArrayTypeNode()', () => {
    it('undefined item', () => {
        const node: ArrayTypeNode = createArrayTypeNode(undefType);
        expect(node).toStrictEqual(arrayType(undefType));
    });

    it('string item', () => {
        const node: ArrayTypeNode = createArrayTypeNode(stringType);
        expect(node).toStrictEqual(arrayType(stringType));
    });
});

describe('createUnionTypeNode()', () => {
    type UnionChildTypeNode = Exclude<TypeNode, UndefinedTypeNode>;

    it('empty children', () => {
        const node: UnionTypeNode = createUnionTypeNode([]);
        expect(node).toStrictEqual(unionType({}));
    });

    const table: Array<[UnionChildTypeNode[], UnionTypeNode['children']]> = [
        [
            [
                boolType,
            ],
            { boolean: boolType },
        ],
        [
            [
                stringType,
            ],
            { string: stringType },
        ],
        [
            [
                arrayType(undefType),
            ],
            { array: arrayType(undefType) },
        ],
        [
            [
                recordType({ foo: undefType }),
            ],
            { record: recordType({ foo: undefType }) },
        ],
        [
            [
                unionType({ string: stringType }),
            ],
            { string: stringType },
        ],
        [
            [
                unionType({ string: stringType, boolean: boolType }),
            ],
            { string: stringType, boolean: boolType },
        ],
        [
            [
                boolType,
                boolType,
            ],
            { boolean: boolType },
        ],
        [
            [
                boolType,
                stringType,
            ],
            {
                boolean: boolType,
                string: stringType,
            },
        ],
        [
            [
                boolType,
                arrayType(undefType),
            ],
            {
                boolean: boolType,
                array: arrayType(undefType),
            },
        ],
        [
            [
                boolType,
                recordType({ foo: undefType }),
            ],
            {
                boolean: boolType,
                record: recordType({ foo: undefType }),
            },
        ],
        [
            [
                boolType,
                unionType({ boolean: boolType }),
            ],
            { boolean: boolType },
        ],
        [
            [
                boolType,
                unionType({ string: stringType }),
            ],
            {
                boolean: boolType,
                string: stringType,
            },
        ],
        [
            [
                boolType,
                unionType({ string: stringType, boolean: boolType }),
            ],
            {
                boolean: boolType,
                string: stringType,
            },
        ],
        [
            [
                stringType,
                boolType,
            ],
            {
                string: stringType,
                boolean: boolType,
            },
        ],
        [
            [
                stringType,
                stringType,
            ],
            { string: stringType },
        ],
        [
            [
                stringType,
                arrayType(undefType),
            ],
            {
                string: stringType,
                array: arrayType(undefType),
            },
        ],
        [
            [
                stringType,
                recordType({ foo: undefType }),
            ],
            {
                string: stringType,
                record: recordType({ foo: undefType }),
            },
        ],
        [
            [
                stringType,
                unionType({ boolean: boolType }),
            ],
            {
                string: stringType,
                boolean: boolType,
            },
        ],
        [
            [
                stringType,
                unionType({ string: stringType }),
            ],
            { string: stringType },
        ],
        [
            [
                stringType,
                unionType({ string: stringType, boolean: boolType }),
            ],
            {
                string: stringType,
                boolean: boolType,
            },
        ],
        [
            [
                arrayType(undefType),
                boolType,
            ],
            {
                array: arrayType(undefType),
                boolean: boolType,
            },
        ],
        [
            [
                arrayType(undefType),
                stringType,
            ],
            {
                array: arrayType(undefType),
                string: stringType,
            },
        ],
        [
            [
                arrayType(undefType),
                arrayType(undefType),
            ],
            {
                array: arrayType(undefType),
            },
        ],
        [
            [
                arrayType(undefType),
                arrayType(boolType),
            ],
            {
                array: arrayType(boolType),
            },
        ],
        [
            [
                arrayType(undefType),
                arrayType(stringType),
            ],
            {
                array: arrayType(stringType),
            },
        ],
        [
            [
                arrayType(boolType),
                arrayType(stringType),
            ],
            {
                array: arrayType(unionType({
                    boolean: boolType,
                    string: stringType,
                })),
            },
        ],
        [
            [
                arrayType(undefType),
                recordType({ foo: undefType }),
            ],
            {
                array: arrayType(undefType),
                record: recordType({ foo: undefType }),
            },
        ],
        [
            [
                arrayType(undefType),
                unionType({ string: stringType }),
            ],
            {
                array: arrayType(undefType),
                string: stringType,
            },
        ],
        [
            [
                arrayType(undefType),
                unionType({ array: arrayType(undefType) }),
            ],
            {
                array: arrayType(undefType),
            },
        ],
        [
            [
                arrayType(undefType),
                unionType({ array: arrayType(stringType) }),
            ],
            {
                array: arrayType(stringType),
            },
        ],
        [
            [
                arrayType(boolType),
                unionType({ array: arrayType(stringType) }),
            ],
            {
                array: arrayType(unionType({
                    boolean: boolType,
                    string: stringType,
                })),
            },
        ],
        [
            [
                arrayType(undefType),
                unionType({ string: stringType, boolean: boolType }),
            ],
            {
                array: arrayType(undefType),
                boolean: boolType,
                string: stringType,
            },
        ],
        [
            [
                recordType({ foo: undefType }),
                boolType,
            ],
            {
                record: recordType({ foo: undefType }),
                boolean: boolType,
            },
        ],
        [
            [
                recordType({ foo: undefType }),
                stringType,
            ],
            {
                record: recordType({ foo: undefType }),
                string: stringType,
            },
        ],
        [
            [
                recordType({ foo: undefType }),
                arrayType(undefType),
            ],
            {
                record: recordType({ foo: undefType }),
                array: arrayType(undefType),
            },
        ],
        [
            [
                recordType({ foo: undefType }),
                recordType({ foo: undefType }),
            ],
            {
                record: recordType({ foo: undefType }),
            },
        ],
        [
            [
                recordType({ foo: undefType }),
                recordType({ foo: boolType }),
            ],
            {
                record: recordType({ foo: boolType }),
            },
        ],
        [
            [
                recordType({ foo: boolType }),
                recordType({ foo: stringType }),
            ],
            {
                record: recordType({
                    foo: unionType({
                        boolean: boolType,
                        string: stringType,
                    }),
                }),
            },
        ],
        [
            [
                recordType({ foo: undefType }),
                recordType({ bar: undefType }),
            ],
            {
                record: recordType({
                    foo: undefType,
                    bar: undefType,
                }),
            },
        ],
        [
            [
                recordType({ foo: undefType }),
                unionType({ boolean: boolType }),
            ],
            {
                record: recordType({ foo: undefType }),
                boolean: boolType,
            },
        ],
        [
            [
                recordType({ foo: undefType }),
                unionType({ string: stringType }),
            ],
            {
                record: recordType({ foo: undefType }),
                string: stringType,
            },
        ],
        [
            [
                recordType({ foo: undefType }),
                unionType({ string: stringType, boolean: boolType }),
            ],
            {
                record: recordType({ foo: undefType }),
                string: stringType,
                boolean: boolType,
            },
        ],
        [
            [
                recordType({ foo: undefType }),
                unionType({ record: recordType({ foo: undefType }) }),
            ],
            {
                record: recordType({ foo: undefType }),
            },
        ],
        [
            [
                recordType({ foo: undefType }),
                unionType({ record: recordType({ foo: stringType }) }),
            ],
            {
                record: recordType({ foo: stringType }),
            },
        ],
        [
            [
                recordType({ foo: boolType }),
                unionType({ record: recordType({ foo: stringType }) }),
            ],
            {
                record: recordType({
                    foo: unionType({
                        boolean: boolType,
                        string: stringType,
                    }),
                }),
            },
        ],
        [
            [
                recordType({ foo: undefType }),
                unionType({ record: recordType({ bar: undefType }) }),
            ],
            {
                record: recordType({
                    foo: undefType,
                    bar: undefType,
                }),
            },
        ],
        [
            [
                unionType({ boolean: boolType }),
                boolType,
            ],
            { boolean: boolType },
        ],
        [
            [
                unionType({ boolean: boolType }),
                stringType,
            ],
            {
                boolean: boolType,
                string: stringType,
            },
        ],
        [
            [
                unionType({ string: stringType }),
                stringType,
            ],
            { string: stringType },
        ],
        [
            [
                unionType({ boolean: boolType }),
                arrayType(undefType),
            ],
            {
                boolean: boolType,
                array: arrayType(undefType),
            },
        ],
        [
            [
                unionType({ array: arrayType(undefType) }),
                arrayType(undefType),
            ],
            {
                array: arrayType(undefType),
            },
        ],
        [
            [
                unionType({ array: arrayType(stringType) }),
                arrayType(undefType),
            ],
            {
                array: arrayType(stringType),
            },
        ],
        [
            [
                unionType({ array: arrayType(stringType) }),
                arrayType(boolType),
            ],
            {
                array: arrayType(unionType({
                    string: stringType,
                    boolean: boolType,
                })),
            },
        ],
        [
            [
                unionType({ boolean: boolType }),
                recordType({ foo: undefType }),
            ],
            {
                boolean: boolType,
                record: recordType({ foo: undefType }),
            },
        ],
        [
            [
                unionType({ record: recordType({ foo: undefType }) }),
                recordType({ foo: undefType }),
            ],
            {
                record: recordType({ foo: undefType }),
            },
        ],
        [
            [
                unionType({ record: recordType({ foo: stringType }) }),
                recordType({ foo: undefType }),
            ],
            {
                record: recordType({ foo: stringType }),
            },
        ],
        [
            [
                unionType({ record: recordType({ foo: undefType }) }),
                recordType({ foo: stringType }),
            ],
            {
                record: recordType({ foo: stringType }),
            },
        ],
        [
            [
                unionType({ record: recordType({ foo: boolType }) }),
                recordType({ foo: stringType }),
            ],
            {
                record: recordType({
                    foo: unionType({
                        boolean: boolType,
                        string: stringType,
                    }),
                }),
            },
        ],
        [
            [
                unionType({ boolean: boolType }),
                unionType({ boolean: boolType }),
            ],
            { boolean: boolType },
        ],
        [
            [
                unionType({ boolean: boolType }),
                unionType({ string: stringType }),
            ],
            {
                boolean: boolType,
                string: stringType,
            },
        ],
        [
            [
                unionType({ boolean: boolType }),
                unionType({ string: stringType, boolean: boolType }),
            ],
            {
                boolean: boolType,
                string: stringType,
            },
        ],
        [
            [
                unionType({ array: arrayType(boolType) }),
                unionType({ string: stringType }),
            ],
            {
                array: arrayType(boolType),
                string: stringType,
            },
        ],
        [
            [
                unionType({ array: arrayType(boolType) }),
                unionType({ array: arrayType(boolType) }),
            ],
            {
                array: arrayType(boolType),
            },
        ],
        [
            [
                unionType({ array: arrayType(boolType) }),
                unionType({ array: arrayType(stringType) }),
            ],
            {
                array: arrayType(unionType({
                    boolean: boolType,
                    string: stringType,
                })),
            },
        ],
        [
            [
                unionType({ record: recordType({ foo: undefType }) }),
                unionType({ boolean: boolType }),
            ],
            {
                record: recordType({ foo: undefType }),
                boolean: boolType,
            },
        ],
        [
            [
                unionType({ record: recordType({ foo: undefType }) }),
                unionType({ record: recordType({ foo: undefType }) }),
            ],
            {
                record: recordType({ foo: undefType }),
            },
        ],
        [
            [
                unionType({ record: recordType({ foo: undefType }) }),
                unionType({ record: recordType({ foo: stringType }) }),
            ],
            {
                record: recordType({ foo: stringType }),
            },
        ],
        [
            [
                unionType({ record: recordType({ foo: boolType }) }),
                unionType({ record: recordType({ foo: stringType }) }),
            ],
            {
                record: recordType({
                    foo: unionType({
                        boolean: boolType,
                        string: stringType,
                    }),
                }),
            },
        ],
        [
            [
                unionType({ record: recordType({ foo: undefType }) }),
                unionType({ record: recordType({ bar: undefType }) }),
            ],
            {
                record: recordType({
                    foo: undefType,
                    bar: undefType,
                }),
            },
        ],
    ];
    it.each(table.map(([c, e]) => [c.map(printTypeNode).join(' x '), c, e] as const))(
        'children: %s',
        (_, childrenList, expectedChildren) => {
            const node: UnionTypeNode = createUnionTypeNode(childrenList);
            expect(node).toStrictEqual(unionType(expectedChildren));
        },
    );
});

describe('createEmptyTypeNode()', () => {
    it('type:undefined', () => {
        const node: UndefinedTypeNode = createEmptyTypeNode('undefined');
        expect(node).toStrictEqual(undefType);
    });

    it('type:boolean', () => {
        const node: BooleanTypeNode = createEmptyTypeNode('boolean');
        expect(node).toStrictEqual(boolType);
    });

    it('type:string', () => {
        const node: StringTypeNode = createEmptyTypeNode('string');
        expect(node).toStrictEqual(stringType);
    });

    it('type:array', () => {
        const node: ArrayTypeNode = createEmptyTypeNode('array');
        expect(node).toStrictEqual(arrayType(undefType));
    });

    it('type:record', () => {
        const node: RecordTypeNode = createEmptyTypeNode('record');
        expect(node).toStrictEqual(recordType({}));
    });
});

describe('getTypeNodeByTypeName()', () => {
    it('match', () => {
        expect(getTypeNodeByTypeName(undefType, 'undefined'))
            .toStrictEqual(undefType);
    });

    it('match union', () => {
        const unionNode = unionType({ string: stringType });
        expect(getTypeNodeByTypeName(unionNode, 'union'))
            .toStrictEqual(unionNode);
    });

    it('match in union', () => {
        const arrayNode = arrayType(boolType);
        expect(getTypeNodeByTypeName(unionType({ array: arrayNode }), 'array'))
            .toStrictEqual(arrayNode);
    });

    it('no match', () => {
        expect(getTypeNodeByTypeName(undefType, 'string')).toBeUndefined();
    });
});

describe('mergeTypeNode()', () => {
    describe('pass-through', () => {
        const table: TypeNode[] = [
            undefType,
            stringType,
            boolType,
            arrayType(boolType),
            recordType({ hoge: boolType }),
            unionType({ string: stringType }),
        ];
        it.each(
            table.flatMap(node2 =>
                [undefined, undefType].map(undef =>
                    [
                        `${
                            undef
                                ? `node:${printTypeNode(undef)}`
                                : `value:${String(undef)}`
                        } x ${printTypeNode(node2)}`,
                        undef,
                        node2,
                    ] as const
                )
            ),
        )('%s', (_, node1, node2) => {
            expect(mergeTypeNode(node1, node2)).toStrictEqual(node2);
        });
        it.each(
            table.flatMap(node1 =>
                [undefType].map(undef =>
                    [
                        `${printTypeNode(node1)} x node:${printTypeNode(undef)}`,
                        node1,
                        undef,
                    ] as const
                )
            ),
        )('%s', (_, node1, node2) => {
            expect(mergeTypeNode(node1, node2)).toStrictEqual(node1);
        });
    });

    describe('same type', () => {
        const table: Array<[TypeNode, TypeNode, TypeNode]> = [
            /**
             * same `PrimitiveTypeNode`
             */
            [
                undefType,
                undefType,
                undefType,
            ],
            [
                boolType,
                boolType,
                boolType,
            ],
            [
                stringType,
                stringType,
                stringType,
            ],
            /**
             * same `ArrayTypeNode` / same item types
             */
            [
                arrayType(undefType),
                arrayType(undefType),
                arrayType(undefType),
            ],
            [
                arrayType(stringType),
                arrayType(stringType),
                arrayType(stringType),
            ],
            /**
             * same `ArrayTypeNode` / `UndefinedTypeNode` x any type
             */
            [
                arrayType(stringType),
                arrayType(undefType),
                arrayType(stringType),
            ],
            [
                arrayType(undefType),
                arrayType(boolType),
                arrayType(boolType),
            ],
            /**
             * same `ArrayTypeNode` / different item types
             */
            [
                arrayType(boolType),
                arrayType(stringType),
                arrayType(unionType({
                    boolean: boolType,
                    string: stringType,
                })),
            ],
            [
                arrayType(stringType),
                arrayType(boolType),
                arrayType(unionType({
                    boolean: boolType,
                    string: stringType,
                })),
            ],
            /**
             * same `RecordTypeNode` / properties with the same name / same types
             */
            [
                recordType({ hoge: undefType }),
                recordType({ hoge: undefType }),
                recordType({ hoge: undefType }),
            ],
            [
                recordType({ hoge: boolType }),
                recordType({ hoge: boolType }),
                recordType({ hoge: boolType }),
            ],
            [
                recordType({ hoge: stringType }),
                recordType({ hoge: stringType }),
                recordType({ hoge: stringType }),
            ],
            /**
             * same `RecordTypeNode` / properties with the same name / `UndefinedTypeNode` x any type
             */
            [
                recordType({ hoge: boolType }),
                recordType({ hoge: undefType }),
                recordType({ hoge: boolType }),
            ],
            [
                recordType({ hoge: undefType }),
                recordType({ hoge: stringType }),
                recordType({ hoge: stringType }),
            ],
            /**
             * same `RecordTypeNode` / properties with the same name / different item types
             */
            [
                recordType({ hoge: boolType }),
                recordType({ hoge: stringType }),
                recordType({
                    hoge: unionType({
                        boolean: boolType,
                        string: stringType,
                    }),
                }),
            ],
            [
                recordType({ hoge: stringType }),
                recordType({ hoge: boolType }),
                recordType({
                    hoge: unionType({
                        boolean: boolType,
                        string: stringType,
                    }),
                }),
            ],
            /**
             * same `RecordTypeNode` / properties with different names
             */
            [
                recordType({ hoge: boolType }),
                recordType({ fuga: boolType }),
                recordType({ hoge: boolType, fuga: boolType }),
            ],
            [
                recordType({ hoge: stringType }),
                recordType({ fuga: undefType }),
                recordType({ hoge: stringType, fuga: undefType }),
            ],
            [
                recordType({ hoge: boolType }),
                recordType({ fuga: stringType }),
                recordType({ hoge: boolType, fuga: stringType }),
            ],
            /**
             * same `UnionTypeNode` / same types
             */
            [
                unionType({ boolean: boolType }),
                unionType({ boolean: boolType }),
                unionType({ boolean: boolType }),
            ],
            [
                unionType({ string: stringType }),
                unionType({ string: stringType }),
                unionType({ string: stringType }),
            ],
            /**
             * same `UnionTypeNode` / different types
             */
            [
                unionType({ boolean: boolType }),
                unionType({ string: stringType }),
                unionType({
                    boolean: boolType,
                    string: stringType,
                }),
            ],
            [
                unionType({ string: stringType }),
                unionType({ boolean: boolType }),
                unionType({
                    boolean: boolType,
                    string: stringType,
                }),
            ],
            [
                unionType({ string: stringType, array: arrayType(undefType) }),
                unionType({ boolean: boolType }),
                unionType({
                    boolean: boolType,
                    string: stringType,
                    array: arrayType(undefType),
                }),
            ],
            [
                unionType({ string: stringType, array: arrayType(stringType) }),
                unionType({ boolean: boolType, array: arrayType(stringType) }),
                unionType({
                    boolean: boolType,
                    string: stringType,
                    array: arrayType(stringType),
                }),
            ],
            [
                unionType({ string: stringType, array: arrayType(boolType) }),
                unionType({ boolean: boolType, array: arrayType(stringType) }),
                unionType({
                    boolean: boolType,
                    string: stringType,
                    array: arrayType(unionType({
                        boolean: boolType,
                        string: stringType,
                    })),
                }),
            ],
        ];
        it.each(
            table.map(([node1, node2, expected]) =>
                [[node1, node2].map(printTypeNode).join(' x '), node1, node2, expected] as const
            ),
        )(
            '%s',
            (_, node1, node2, expected) => {
                expect(mergeTypeNode(node1, node2)).toStrictEqual(expected);
            },
        );
    });

    describe('different type', () => {
        const table: Array<[TypeNode, TypeNode, TypeNode]> = [
            /**
             * `TypeNode` x `UndefinedTypeNode`
             */
            [
                undefType,
                undefType,
                undefType,
            ],
            [
                undefType,
                boolType,
                boolType,
            ],
            [
                boolType,
                undefType,
                boolType,
            ],
            [
                undefType,
                stringType,
                stringType,
            ],
            [
                stringType,
                undefType,
                stringType,
            ],
            [
                undefType,
                arrayType(undefType),
                arrayType(undefType),
            ],
            [
                arrayType(undefType),
                undefType,
                arrayType(undefType),
            ],
            /**
             * `TypeNode` x `TypeNode`
             */
            [
                boolType,
                stringType,
                unionType({
                    boolean: boolType,
                    string: stringType,
                }),
            ],
            [
                stringType,
                boolType,
                unionType({
                    boolean: boolType,
                    string: stringType,
                }),
            ],
            [
                boolType,
                arrayType(undefType),
                unionType({
                    boolean: boolType,
                    array: arrayType(undefType),
                }),
            ],
            [
                recordType({ foo: undefType }),
                boolType,
                unionType({
                    boolean: boolType,
                    record: recordType({ foo: undefType }),
                }),
            ],
            /**
             * `TypeNode` x `UnionTypeNode`
             */
            [
                boolType,
                unionType({
                    boolean: boolType,
                }),
                unionType({
                    boolean: boolType,
                }),
            ],
            [
                unionType({
                    boolean: boolType,
                }),
                stringType,
                unionType({
                    boolean: boolType,
                    string: stringType,
                }),
            ],
            [
                stringType,
                unionType({
                    boolean: boolType,
                    array: arrayType(boolType),
                }),
                unionType({
                    boolean: boolType,
                    string: stringType,
                    array: arrayType(boolType),
                }),
            ],
            [
                arrayType(stringType),
                unionType({
                    boolean: boolType,
                    array: arrayType(boolType),
                }),
                unionType({
                    boolean: boolType,
                    array: arrayType(unionType({
                        boolean: boolType,
                        string: stringType,
                    })),
                }),
            ],
        ];
        it.each(
            table.map(([node1, node2, expected]) =>
                [[node1, node2].map(printTypeNode).join(' x '), node1, node2, expected] as const
            ),
        )(
            '%s',
            (_, node1, node2, expected) => {
                expect(mergeTypeNode(node1, node2)).toStrictEqual(expected);
            },
        );
    });
});
