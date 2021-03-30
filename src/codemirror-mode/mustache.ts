import CodeMirror from 'codemirror';
import 'codemirror/addon/mode/simple';
import 'codemirror/addon/mode/multiplex';

CodeMirror.defineSimpleMode('mustache-tags', {
    start: [
        { regex: /\{\{\{/, push: 'mustache_raw', token: 'bracket' },
        { regex: /\{\{\s*!/, push: 'comment', token: 'comment' },
        { regex: /\{\{/, push: 'mustache', token: 'bracket' },
    ],
    mustache_raw: [
        { regex: /\}{3}/, pop: true, token: 'bracket' },

        // Variable
        { regex: /(?!\}{3})\S(?:\s*(?!\}{3})\S)*/, token: 'variable-2' },
    ],
    mustache: [
        { regex: /\}{2}/, pop: true, token: 'bracket' },

        // Mustache keywords
        { regex: /[>&]|[#^/]\s*(?:(?!\}{2}).)*/, token: 'keyword' },

        // Variable
        { regex: /(?!\}{2})\S(?:\s*(?!\}{2})\S)*/, token: 'variable-2' },
    ],
    comment: [
        { regex: '}}', pop: true, token: 'comment' },
        { regex: /(?:(?!\}{2}).)*/, token: 'comment' },
    ],
});

CodeMirror.defineMode('mustache', function(config, parserConfig) {
    const mustache = CodeMirror.getMode(config, 'mustache-tags');
    if (!parserConfig || !parserConfig.base) return mustache;
    return CodeMirror.multiplexingMode(
        CodeMirror.getMode(config, parserConfig.base),
        { open: '{{', close: /\}{2,3}/, mode: mustache, parseDelimiters: true },
    );
});
