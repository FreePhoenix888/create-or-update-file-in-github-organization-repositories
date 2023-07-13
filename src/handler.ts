async ({deep, data: {newLink: runLink}}) => {
   const {Exp} = await import("@deep-foundation/deeplinks/imports/client");
   const {Link} = await import("@deep-foundation/deeplinks/imports/minilinks");
   async function main() {
     const { Octokit } = await import("@octokit/rest");
 
     const config = await getConfig();
 
 // create a personal access token at https://github.com/settings/tokens/new?scopes=repo
 const octokit = new Octokit({
   auth: config.githubApiToken
 });
 
 const orgName = 'deep-foundation';
 const workflowFilename = '.github/workflows/npm-build.yml';
 
 const workflowFileContent = `
 name: Npm Build
 
 on:
   pull_request:
     types: [opened, reopened, edited, synchronize]
   workflow_dispatch:
 
 jobs:
   main:
     uses: deep-foundation/workflows/.github/workflows/npm-build.yml@main
 
 `.trim();
 
 async function main() {
   const repos = await octokit.paginate(octokit.rest.repos.listForOrg, {
     org: orgName,
     type: 'all'
   });
 
   repos.map(async (repo) => {
     const { data: file } = await octokit.rest.repos.getContent({
       owner: orgName,
       repo: repo.name,
       path: workflowFilename
     }).catch(() => ({}));  // if file does not exist, continue
 
     const params = {
       owner: orgName,
       repo: repo.name,
       path: workflowFilename,
       message: `Add/update workflow file ${workflowFilename}`,
       content: Buffer.from(workflowFileContent).toString('base64'),
       ...(file && { sha: file.sha })  // if file exists, include sha to update
     };
 
     await octokit.rest.repos.createOrUpdateFileContents(params).then(() => {
       console.log(`Successfully created/updated workflow file in ${repo.name}.`);
     }).catch(error => {
       console.error(`Error creating/updating workflow file in ${repo.name}: ${error}`);
     });
   })
 }
   }
 
   async function getGithubApiTokenLink(): Promise<Link>  {
     const exp: Exp = {
       type_id: {
         _id: [deep.linkId, "GithubApiToken"]
       }
     }
     const link = await getLink({
       exp
     })
     return link;  
   }
 
   export interface Config {
     githubApiToken: string;
     organizationName: string;
     filePath: string;
     fileContent: string;
     repositoryNamesToIgnore: string[];
   }
 
   async function getConfigLink() {
     const exp: Exp = {
       id: runLink.from_id
     }
     const link = await getLink({
       exp
     })
     return link;
   }
 
   async function getConfig() {
     const link = await getConfigLink();
     const config = await link.value.value;
     if(!config) {
       throw new Error(`##${link.id} must have a value`)
     }
     return config;
   }
 
 async function getLink(param: GetLinkOrUndefined): Promise<Link>{
   const link = await getLinkOrUndefuned(param);
   if(!link) {
     throw new Error(`Select with exp ${JSON.stringify(param.exp)} did not return a link.`)
   }
 }
 
 interface GetLinkOrUndefined {
   exp: Exp;
 }
 
 async function getLinkOrUndefuned(param: GetLinkOrUndefined): Promise<Link | undefined> {
   const {exp} = param;
   const {data: [link]} = await deep.select(exp);
   return link;
 }
 
 }
 
 