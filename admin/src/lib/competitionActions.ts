'use server';

import { revalidatePath } from 'next/cache';
import { fetchAPI } from './api';

export async function createCompetition(formData: FormData): Promise<string> {
  const bearerToken = process.env.NEXT_PUBLIC_BEARER_TOKEN;
  if (!bearerToken) throw new Error('Bearer token is missing');

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/create/competitions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Create Competition Error:', errorData);
      const errorMessage = errorData.error
        ? `${errorData.message}: ${errorData.error}`
        : errorData.message || 'Failed to create competition';
      throw new Error(errorMessage);
    }

    const data = await response.json();

    const id = data.id || (data.competition && data.competition.id);
    if (!id) {
      console.error('No ID in response:', data);
      throw new Error('API response missing ID');
    }

    revalidatePath('/');

    return id;
  } catch (error) {
    console.error('Error in createCompetition:', error);
    throw error;
  }
}

export async function updateCompetition(
  id: string,
  data: { [key: string]: string | number | boolean }
): Promise<string> {
  const bearerToken = process.env.NEXT_PUBLIC_BEARER_TOKEN;
  if (!bearerToken) throw new Error('Bearer token is missing');

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/update/competitions/${id}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Update failed:', errorData);
    throw new Error(errorData.message || 'Failed to update competition');
  }

  const responseData = await response.json();

  revalidatePath('/');

  return responseData.id || id;
}

export async function deleteCompetition(competitionId: string): Promise<void> {
  const bearerToken = process.env.NEXT_PUBLIC_BEARER_TOKEN;
  if (!bearerToken) throw new Error('Bearer token is missing');

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/delete/competitions/${competitionId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Delete Competition Error:', {
        status: response.status,
        errorData,
      });
      throw new Error(
        errorData.message ||
          `Failed to delete competition (Status: ${response.status})`
      );
    }

    revalidatePath('/');
  } catch (error) {
    console.error('Error in deleteCompetition:', error);
    throw error;
  }
}

export async function createTeam(
  competitionId: string,
  formData: FormData
): Promise<string> {
  const bearerToken = process.env.NEXT_PUBLIC_BEARER_TOKEN;
  if (!bearerToken) throw new Error('Bearer token is missing');

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/create/competitions/${competitionId}/teams`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Create Team Error:', {
        status: response.status,
        errorData,
      });
      throw new Error(
        errorData.message ||
          `Failed to create team (Status: ${response.status})`
      );
    }

    const data = await response.json();
    revalidatePath(`/setup-competition/${competitionId}/teams`);
    return data.id || data.team?.id;
  } catch (error) {
    console.error('Error in createTeam:', error);
    throw error;
  }
}

export async function addExistingTeams(
  competitionId: string,
  teamIds: string[]
): Promise<void> {
  const bearerToken = process.env.NEXT_PUBLIC_BEARER_TOKEN;
  if (!bearerToken) throw new Error('Bearer token is missing');

  try {
    for (const teamId of teamIds) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/create/competition_teams/${competitionId}/teams`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ team_id: teamId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Add Existing Teams Error:', {
          status: response.status,
          errorData,
        });
        throw new Error(errorData.message || 'Failed to add team');
      }
    }
    revalidatePath(`/setup-competition/${competitionId}/teams`);
  } catch (error) {
    console.error('Error in addExistingTeams:', error);
    throw error;
  }
}

export async function createPlayer(
  teamId: string,
  formData: FormData
): Promise<string> {
  const bearerToken = process.env.NEXT_PUBLIC_BEARER_TOKEN;
  if (!bearerToken) throw new Error('Bearer token is missing');

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/create/teams/${teamId}/players`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Create Player Error:', {
        status: response.status,
        errorData,
      });
      throw new Error(
        errorData.message ||
          `Failed to create player (Status: ${response.status})`
      );
    }

    const data = await response.json();
    revalidatePath(`/setup-competition/[id]/teams/${teamId}`);
    return data.id || data.player?.id;
  } catch (error) {
    console.error('Error in createPlayer:', error);
    throw error;
  }
}

export async function updatePlayer(
  teamId: string,
  playerId: string,
  formData: FormData
): Promise<string> {
  const bearerToken = process.env.NEXT_PUBLIC_BEARER_TOKEN;
  if (!bearerToken) throw new Error('Bearer token is missing');

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/update/teams/${teamId}/players/${playerId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Update Player Error:', {
        status: response.status,
        errorData,
      });
      throw new Error(
        errorData.message ||
          `Failed to update player (Status: ${response.status})`
      );
    }

    const data = await response.json();
    revalidatePath(`/setup-competition/[id]/teams/${teamId}`);
    return data.id || data.player?.id || playerId;
  } catch (error) {
    console.error('Error in updatePlayer:', error);
    throw error;
  }
}

export async function addExistingPlayers(
  teamId: string,
  playerIds: string[]
): Promise<void> {
  const bearerToken = process.env.NEXT_PUBLIC_BEARER_TOKEN;
  if (!bearerToken) throw new Error('Bearer token is missing');

  try {
    const promises = playerIds.map(async (playerId) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/create/teams/${teamId}/players/${playerId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Add Existing Player Error:', {
          playerId,
          status: response.status,
          errorData,
        });
        throw new Error(
          `Failed to add player ${playerId} (Status: ${response.status})`
        );
      }
    });

    await Promise.all(promises);
    revalidatePath(`/setup-competition/[id]/teams/${teamId}`);
  } catch (error) {
    console.error('Error in addExistingPlayers:', error);
    throw error;
  }
}

export async function removePlayerFromTeam(
  playerId: string,
  teamId: string
): Promise<void> {
  const bearerToken = process.env.NEXT_PUBLIC_BEARER_TOKEN;
  if (!bearerToken) throw new Error('Bearer token is missing');

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/remove/players/${playerId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ team_id: null }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Remove Player Error:', {
        status: response.status,
        errorData,
      });
      throw new Error(
        errorData.message ||
          `Failed to remove player from team (Status: ${response.status})`
      );
    }

    revalidatePath(`/setup-competition/[id]/teams/${teamId}`);
  } catch (error) {
    console.error('Error in removePlayerFromTeam:', error);
    throw error;
  }
}

export async function removeTeamFromCompetition(
  competitionId: string,
  teamId: string
): Promise<void> {
  const bearerToken = process.env.NEXT_PUBLIC_BEARER_TOKEN;
  if (!bearerToken) throw new Error('Bearer token is missing');

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/delete/competitions/${competitionId}/teams/${teamId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Remove Team Error:', {
        status: response.status,
        errorData,
      });
      throw new Error(
        errorData.message ||
          `Failed to remove team from competition (Status: ${response.status})`
      );
    }

    revalidatePath(`/setup-competition/${competitionId}/teams`);
  } catch (error) {
    console.error('Error in removeTeamFromCompetition:', error);
    throw error;
  }
}

export async function createCategory(data: { name: string; slug: string }) {
  await fetchAPI('/api/admin/create/category', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  revalidatePath('/dashboard/categories');
}

export async function updateCategory(
  id: string,
  data: { name: string; slug: string }
) {
  await fetchAPI(`/api/admin/update/category/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  revalidatePath('/dashboard/categories');
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const bearerToken = process.env.NEXT_PUBLIC_BEARER_TOKEN;
  if (!bearerToken) throw new Error('Bearer token is missing');

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/delete/category/${categoryId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Delete Category Error:', {
        status: response.status,
        errorData,
      });
      throw new Error(
        errorData.message ||
          `Failed to delete category (Status: ${response.status})`
      );
    }

    revalidatePath('/dashboard/categories');
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    throw error;
  }
}

export async function createStandalonePlayer(
  formData: FormData
): Promise<string> {
  const bearerToken = process.env.NEXT_PUBLIC_BEARER_TOKEN;
  if (!bearerToken) throw new Error('Bearer token is missing');

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/create/players`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Create Standalone Player Error:', {
        status: response.status,
        errorData,
      });
      throw new Error(
        errorData.message ||
          `Failed to create player (Status: ${response.status})`
      );
    }

    const data = await response.json();
    revalidatePath('/players');
    return data.id || data.player?.id;
  } catch (error) {
    console.error('Error in createStandalonePlayer:', error);
    throw error;
  }
}
