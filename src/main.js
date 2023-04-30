require('dotenv-expand').expand(require('dotenv').config())
const core = require('@actions/core');
const {context} = require('@actions/github')
const {Octokit} = require("@octokit/rest")

async function main() {
    const inputLabels = core.getInput('labels').split('\n').filter((x) => x !== '');
    const separator = core.getInput('separator')
    const octokit = new Octokit({auth: core.getInput('github_token')});
    const {owner, repo} = context.repo;
    const pull_number = context.payload.number
    const {data: {labels: pullLabels}} = await octokit.rest.pulls.get({owner, repo, pull_number})
    for (const inputLabel of inputLabels) {
        let found = false
        for (const l of pullLabels) {
            const [name, value] = l.name.split(separator)
            if (name === inputLabel) {
                found = true
                core.setOutput(name, value?.trim() ?? true)
                core.exportVariable(name.toUpperCase(), value?.trim() ?? true)
           }
        }
        found ? core.debug(`found label: ${inputLabel}`) : core.setFailed(`label ${inputLabel} not found`)
    }
}

main().catch(err => core.setFailed(err));