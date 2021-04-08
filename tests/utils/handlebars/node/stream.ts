import {
    createArrayTypeNode as arrayType,
    createBooleanTypeNode,
    createRecordTypeNode as recordType,
    createStringTypeNode,
    createUndefinedTypeNode,
    createUnionTypeNode as unionType,
} from '../../../../src/utils/handlebars/node';
import { NodeStream } from '../../../../src/utils/handlebars/node/stream';

const undefType = createUndefinedTypeNode();
const stringType = createStringTypeNode();
const boolType = createBooleanTypeNode();

describe('class NodeStream', () => {
    it('default', () => {
        const stream = new NodeStream();
        expect(stream.node).toStrictEqual(undefType);
    });

    describe('path:/', () => {
        it('type:boolean', () => {
            const stream = new NodeStream();
            stream.add([], 'boolean');
            expect(stream.node).toStrictEqual(boolType);
        });
        it('type:string', () => {
            const stream = new NodeStream();
            stream.add([], 'string');
            expect(stream.node).toStrictEqual(stringType);
        });
        it('type:array', () => {
            const stream = new NodeStream();
            stream.add([], 'array');
            expect(stream.node).toStrictEqual(arrayType(undefType));
        });
        it('type:record', () => {
            const stream = new NodeStream();
            stream.add([], 'record');
            expect(stream.node).toStrictEqual(recordType({}));
        });
        it('type:union(boolean, string)', () => {
            const stream = new NodeStream();
            stream.add([], 'boolean');
            stream.add([], 'string');
            expect(stream.node).toStrictEqual(unionType([
                boolType,
                stringType,
            ]));
        });
    });

    describe('path:foo', () => {
        it('type:boolean', () => {
            const stream = new NodeStream();
            stream.add(['foo'], 'boolean');
            expect(stream.node).toStrictEqual(recordType({
                foo: boolType,
            }));
        });
        it('type:union(boolean, string)', () => {
            const stream = new NodeStream();
            stream.add(['foo'], 'boolean');
            stream.add(['foo'], 'string');
            expect(stream.node).toStrictEqual(recordType({
                foo: unionType([
                    boolType,
                    stringType,
                ]),
            }));
        });
    });

    describe('path:foo/bar', () => {
        it('type:boolean', () => {
            const stream = new NodeStream();
            stream.add(['foo', 'bar'], 'boolean');
            expect(stream.node).toStrictEqual(recordType({
                foo: recordType({
                    bar: boolType,
                }),
            }));
        });
        it('type:union(boolean, string)', () => {
            const stream = new NodeStream();
            stream.add(['foo', 'bar'], 'boolean');
            stream.add(['foo', 'bar'], 'string');
            expect(stream.node).toStrictEqual(recordType({
                foo: recordType({
                    bar: unionType([
                        boolType,
                        stringType,
                    ]),
                }),
            }));
        });
    });

    describe('path:foo/[index]', () => {
        it('type:boolean', () => {
            const stream = new NodeStream();
            stream.add(['foo', NodeStream.arrayIndex], 'boolean');
            expect(stream.node).toStrictEqual(recordType({
                foo: arrayType(boolType),
            }));
        });
        it('type:union(boolean, string)', () => {
            const stream = new NodeStream();
            stream.add(['foo', NodeStream.arrayIndex], 'boolean');
            stream.add(['foo', NodeStream.arrayIndex], 'string');
            expect(stream.node).toStrictEqual(recordType({
                foo: arrayType(
                    unionType([
                        boolType,
                        stringType,
                    ]),
                ),
            }));
        });
    });

    describe('path:foo/[index]/hoge', () => {
        it('type:boolean', () => {
            const stream = new NodeStream();
            stream.add(['foo', NodeStream.arrayIndex, 'hoge'], 'boolean');
            expect(stream.node).toStrictEqual(recordType({
                foo: arrayType(
                    recordType({
                        hoge: boolType,
                    }),
                ),
            }));
        });
        it('type:union(boolean, string)', () => {
            const stream = new NodeStream();
            stream.add(['foo', NodeStream.arrayIndex, 'hoge'], 'boolean');
            stream.add(['foo', NodeStream.arrayIndex, 'hoge'], 'string');
            expect(stream.node).toStrictEqual(recordType({
                foo: arrayType(
                    recordType({
                        hoge: unionType([
                            boolType,
                            stringType,
                        ]),
                    }),
                ),
            }));
        });
    });

    describe('multi path', () => {
        it('foo/hoge and foo/fuga', () => {
            const stream = new NodeStream();
            stream.add(['foo', 'hoge'], 'boolean');
            stream.add(['foo', 'fuga'], 'string');
            expect(stream.node).toStrictEqual(recordType({
                foo: recordType({
                    hoge: boolType,
                    fuga: stringType,
                }),
            }));
        });
        it('foo and foo/bar', () => {
            const stream = new NodeStream();
            stream.add(['foo'], 'boolean');
            stream.add(['foo', 'bar'], 'boolean');
            expect(stream.node).toStrictEqual(recordType({
                foo: unionType([
                    boolType,
                    recordType({
                        bar: boolType,
                    }),
                ]),
            }));
        });
        it('foo/bar and foo', () => {
            const stream = new NodeStream();
            stream.add(['foo', 'bar'], 'boolean');
            stream.add(['foo'], 'boolean');
            expect(stream.node).toStrictEqual(recordType({
                foo: unionType([
                    boolType,
                    recordType({
                        bar: boolType,
                    }),
                ]),
            }));
        });
        it('foo/hoge and foo and foo/fuga', () => {
            const stream = new NodeStream();
            stream.add(['foo', 'hoge'], 'boolean');
            stream.add(['foo'], 'boolean');
            stream.add(['foo', 'fuga'], 'string');
            expect(stream.node).toStrictEqual(recordType({
                foo: unionType([
                    boolType,
                    recordType({
                        hoge: boolType,
                        fuga: stringType,
                    }),
                ]),
            }));
        });
        it('foo/[index]/hoge and foo/[index]/fuga', () => {
            const stream = new NodeStream();
            stream.add(['foo', NodeStream.arrayIndex, 'hoge'], 'boolean');
            stream.add(['foo', NodeStream.arrayIndex, 'fuga'], 'string');
            expect(stream.node).toStrictEqual(recordType({
                foo: arrayType(
                    recordType({
                        hoge: boolType,
                        fuga: stringType,
                    }),
                ),
            }));
        });
        it('foo/[index]/hoge and foo/[index]', () => {
            const stream = new NodeStream();
            stream.add(['foo', NodeStream.arrayIndex, 'hoge'], 'boolean');
            stream.add(['foo', NodeStream.arrayIndex], 'string');
            expect(stream.node).toStrictEqual(recordType({
                foo: arrayType(
                    unionType([
                        recordType({
                            hoge: boolType,
                        }),
                        stringType,
                    ]),
                ),
            }));
        });
        it('foo/[index] and foo/[index]/hoge', () => {
            const stream = new NodeStream();
            stream.add(['foo', NodeStream.arrayIndex], 'string');
            stream.add(['foo', NodeStream.arrayIndex, 'hoge'], 'boolean');
            expect(stream.node).toStrictEqual(recordType({
                foo: arrayType(
                    unionType([
                        recordType({
                            hoge: boolType,
                        }),
                        stringType,
                    ]),
                ),
            }));
        });
        it('foo/[index]/hoge and foo/bar', () => {
            const stream = new NodeStream();
            stream.add(['foo', NodeStream.arrayIndex, 'hoge'], 'boolean');
            stream.add(['foo', 'bar'], 'boolean');
            expect(stream.node).toStrictEqual(recordType({
                foo: unionType([
                    arrayType(
                        recordType({
                            hoge: boolType,
                        }),
                    ),
                    recordType({
                        bar: boolType,
                    }),
                ]),
            }));
        });
        it('foo/bar and foo/[index]/hoge', () => {
            const stream = new NodeStream();
            stream.add(['foo', 'bar'], 'boolean');
            stream.add(['foo', NodeStream.arrayIndex, 'hoge'], 'boolean');
            expect(stream.node).toStrictEqual(recordType({
                foo: unionType([
                    arrayType(
                        recordType({
                            hoge: boolType,
                        }),
                    ),
                    recordType({
                        bar: boolType,
                    }),
                ]),
            }));
        });
    });

    describe('duplicate value', () => {
        it('type:boolean', () => {
            const stream = new NodeStream();
            stream.add([], 'boolean');
            stream.add([], 'boolean');
            expect(stream.node).toStrictEqual(boolType);
        });
        it('type:string', () => {
            const stream = new NodeStream();
            stream.add([], 'string');
            stream.add([], 'string');
            expect(stream.node).toStrictEqual(stringType);
        });
        it('type:array', () => {
            const stream = new NodeStream();
            stream.add([], 'array');
            stream.add([], 'array');
            expect(stream.node).toStrictEqual(arrayType(undefType));
        });
        it('type:record', () => {
            const stream = new NodeStream();
            stream.add([], 'record');
            stream.add([], 'record');
            expect(stream.node).toStrictEqual(recordType({}));
        });
        it('type:union(boolean, string)', () => {
            const stream = new NodeStream();
            stream.add([], 'boolean');
            stream.add([], 'string');
            stream.add([], 'string');
            stream.add([], 'boolean');
            stream.add([], 'string');
            expect(stream.node).toStrictEqual(unionType([
                boolType,
                stringType,
            ]));
        });
        it('type:union(boolean, string, array)', () => {
            const stream = new NodeStream();
            stream.add([], 'boolean');
            stream.add([], 'string');
            stream.add([], 'array');
            stream.add([], 'string');
            stream.add([], 'array');
            stream.add([], 'boolean');
            stream.add([], 'string');
            stream.add([], 'array');
            stream.add([], 'boolean');
            expect(stream.node).toStrictEqual(unionType([
                boolType,
                stringType,
                arrayType(undefType),
            ]));
        });
    });

    describe('re-assign parent', () => {
        it('type:array', () => {
            const stream = new NodeStream();
            const expected = recordType({
                foo: arrayType(boolType),
            });

            stream.add(['foo', NodeStream.arrayIndex], 'boolean');
            expect(stream.node).toStrictEqual(expected);

            stream.add(['foo'], 'array');
            expect(stream.node).toStrictEqual(expected);
        });
        it('type:array (in union)', () => {
            const stream = new NodeStream();
            const expected = recordType({
                foo: unionType([
                    arrayType(boolType),
                    boolType,
                ]),
            });

            stream.add(['foo', NodeStream.arrayIndex], 'boolean');
            stream.add(['foo'], 'boolean');
            expect(stream.node).toStrictEqual(expected);

            stream.add(['foo'], 'array');
            expect(stream.node).toStrictEqual(expected);
        });
        it('type:record', () => {
            const stream = new NodeStream();
            const expected = recordType({
                foo: recordType({
                    bar: boolType,
                }),
            });

            stream.add(['foo', 'bar'], 'boolean');
            expect(stream.node).toStrictEqual(expected);

            stream.add(['foo'], 'record');
            expect(stream.node).toStrictEqual(expected);
        });
        it('type:record (in union)', () => {
            const stream = new NodeStream();
            const expected = recordType({
                foo: unionType([
                    recordType({
                        bar: boolType,
                    }),
                    stringType,
                ]),
            });

            stream.add(['foo', 'bar'], 'boolean');
            stream.add(['foo'], 'string');
            expect(stream.node).toStrictEqual(expected);

            stream.add(['foo'], 'record');
            expect(stream.node).toStrictEqual(expected);
        });
    });
});
