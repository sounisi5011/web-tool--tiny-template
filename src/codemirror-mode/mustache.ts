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
        { regex: /\}\}\}/, pop: true, token: 'bracket' },

        // Variable
        { regex: /(?:(?!\}\}).)+/, token: 'variable' },
    ],
    mustache: [
        { regex: /\}\}/, pop: true, token: 'bracket' },

        // Mustache keywords
        { regex: /[>&]|[#^/]\s*(?:(?!\}\}).)*/, token: 'keyword' },

        // Variable
        { regex: /(?:(?!\}\}).)+/, token: 'variable-2' },
    ],
    comment: [
        { regex: /\}\}/, pop: true, token: 'comment' },
        { regex: /(?:(?!\}\}).)*/, token: 'comment' },
    ],
});

CodeMirror.defineMode('mustache', function(config, parserConfig) {
    const mustache = CodeMirror.getMode(config, 'mustache-tags');
    if (!parserConfig || !parserConfig.base) return mustache;
    return CodeMirror.multiplexingMode(
        CodeMirror.getMode(config, parserConfig.base),
        { open: '{{', close: /\}\}\}?/, mode: mustache, parseDelimiters: true },
    );
});
