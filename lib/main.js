"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const github = __importStar(require("@actions/github"));
const core = __importStar(require("@actions/core"));
const now = __importStar(require("now-client"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const zeitToken = core.getInput('zeit-token');
            const githubToken = core.getInput('repo-token');
            const repoDir = core.getInput('repo-dir');
            const buildDir = core.getInput('build-dir') || '';
            const nowJson = fs.readFileSync('now.json', 'utf8');
            const deployment = yield deploy(`${repoDir}/${buildDir}`, zeitToken, JSON.parse(nowJson));
            yield postComment(formatDeployment(deployment), githubToken);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
function deploy(path, token, options) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            for (var _b = __asyncValues(now.createLegacyDeployment(path, Object.assign({ token }, options))), _c; _c = yield _b.next(), !_c.done;) {
                const event = _c.value;
                core.debug(event.payload);
                switch (event.type) {
                    case 'ready':
                        return event.payload;
                    case 'error':
                        throw event.payload;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        throw new Error('No deployment');
    });
}
function formatDeployment(deployment) {
    // @ts-ignore
    const { url } = deployment;
    return `New deployment available on now!\n> http://${url}`;
}
function postComment(body, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = new github.GitHub(token);
        const { owner, repo, number: issue_number } = github.context.issue;
        yield octokit.issues.createComment({ owner, repo, issue_number, body });
    });
}
run();
