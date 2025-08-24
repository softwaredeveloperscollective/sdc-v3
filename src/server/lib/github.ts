import { 
  GitHubContributorsArraySchema, 
  GitHubUserProfileSchema,
  type GitHubContributor,
  type GitHubUserProfile 
} from "@/server/api/routers/schema/contributor";

export async function fetchGitHubContributors(): Promise<GitHubContributor[]> {
  const response = await fetch(
    'https://api.github.com/repos/softwaredeveloperscollective/sdc-v3/contributors',
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN ?? ''}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );


  if (!response.ok) {
    throw new Error(`Failed to fetch contributors: ${response.status}`);
  }

  const data = await response.json() as unknown;
  
  // Validate the response with Zod
  const validatedData = GitHubContributorsArraySchema.parse(data);
  
  return validatedData;
}

export async function fetchGitHubUserProfile(username: string): Promise<GitHubUserProfile> {
  const response = await fetch(
    `https://api.github.com/users/${username}`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN ?? ''}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile for ${username}: ${response.status}`);
  }

  const data = await response.json() as unknown;
  
  // Validate the response with Zod
  const validatedData = GitHubUserProfileSchema.parse(data);
  
  return validatedData;
}