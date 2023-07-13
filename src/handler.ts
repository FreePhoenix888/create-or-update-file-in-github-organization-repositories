import { DeepClient } from '@deep-foundation/deeplinks/imports/client';
import { Exp } from '@deep-foundation/deeplinks/imports/client';
import  { Link as LinkWithTypedParameter } from '@deep-foundation/deeplinks/imports/minilinks';
import { Octokit } from '@octokit/rest';
type Link = LinkWithTypedParameter<number>

async ({ deep, data: { newLink: runLink } }: {deep: DeepClient, data: {newLink: Link}}) => {
  const PACKAGE_NAME = "@freephoenix888/create-or-update-file-in-github-organization-repositories"
  const logs: Array<string> = [];

  main();
  async function main() {
    const logger = await getLogger('main');

    const config = await getConfig();
    logger({main})

    const octokit = new Octokit({
      auth: config.githubApiToken,
    });
    logger({octokit})

    async function main() {

      const config = await getConfig();

      const repos = await octokit.paginate(octokit.rest.repos.listForOrg, config.listForOrgOptions);

      repos.map(async (repo) => {
        const { data: file } = await octokit.rest.repos
          .getContent({
            owner: orgName,
            repo: repo.name,
            path: workflowFilename,
          })
          .catch(() => ({})); // if file does not exist, continue

        const params = {
          owner: orgName,
          repo: repo.name,
          path: workflowFilename,
          message: `Add/update workflow file ${workflowFilename}`,
          content: Buffer.from(workflowFileContent).toString('base64'),
          ...(file && { sha: file.sha }), // if file exists, include sha to update
        };

        await octokit.rest.repos
          .createOrUpdateFileContents(params)
          .then(() => {
            console.log(
              `Successfully created/updated file in ${repo.name}.`
            );
          })
          .catch((error) => {
            console.error(
              `Error creating/updating file in ${repo.name}: ${error}`
            );
          });
      });
    }
  }

  interface Config {
    githubApiToken: string;
    organizationLogin: string;
    filePath: string;
    fileContent: string;
    repositoryNamesToIgnore: string[];
    listForOrgOptions: Parameters<Octokit['repos']['listForOrg']>[0];
  }

  async function getConfigLink(): Promise<Link> {
    const exp: Exp<'links'> = {
      id: runLink.from_id,
    };
    const link = await getLink({
      exp,
    });
    return link;
  }

  async function getConfig(): Promise<Config> {
    const link = await getConfigLink();
    const config = await link.value.value;
    if (!config) {
      throw new Error(`##${link.id} must have a value`);
    }
    return config;
  }

  async function getLink(param: GetLinkOrUndefined): Promise<Link> {
    const link = await getLinkOrUndefuned(param);
    if (!link) {
      throw new Error(
        `Select with exp ${JSON.stringify(param.exp)} did not return a link.`
      );
    }
    return link
  }

  interface GetLinkOrUndefined {
    exp: Exp<'links'>;
  }

  async function getLinkOrUndefuned(
    param: GetLinkOrUndefined
  ): Promise<Link | undefined> {
    const { exp } = param;
    const {
      data: [link],
    } = await deep.select(exp);
    return link;
  }

  async function getLogger(namespace: string) {
    return (mesasge:any) => {
      logs.push(`${PACKAGE_NAME}:${namespace}:${mesasge}`);
    }
  }
};


