
import { ApiRequest, ApiResponse, VisualNovel, Tag, SortOption } from '../types';

const API_ENDPOINT = 'https://api.vndb.org/kana';

async function callVndbApi<T>(endpoint: string, body: ApiRequest): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_ENDPOINT}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling VNDB API:', error);
    throw error;
  }
}

export const searchVns = async (
  query: string,
  tags: Tag[],
  sort: SortOption,
  page: number,
  resultsPerPage: number
): Promise<ApiResponse<VisualNovel>> => {
  
  const filters: any[] = [];
  if (query) {
    filters.push(['search', '=', query]);
  }
  if (tags.length > 0) {
    const tagFilters = tags.map(tag => ['tag', '=', tag.id]);
    if (tagFilters.length === 1) {
        filters.push(tagFilters[0]);
    } else {
        filters.push(['and', ...tagFilters]);
    }
  }

  const requestBody: ApiRequest = {
    filters: filters.length > 1 ? ['and', ...filters] : (filters.length === 1 ? filters[0] : []),
    fields: 'id, title, image.url, rating, votecount, length_minutes',
    sort: sort,
    reverse: sort === 'id' ? false : true,
    page: page,
    results: resultsPerPage,
    count: true,
  };

  return callVndbApi<VisualNovel>('vn', requestBody);
};

export const getVnById = async (id: string): Promise<VisualNovel | null> => {
  const requestBody: ApiRequest = {
    filters: ['id', '=', id],
    fields: 'id, title, alttitle, image{url,dims,sexual,violence,thumbnail}, description, rating, votecount, length_minutes, platforms, languages, tags{id,name,rating,spoiler,category}, screenshots{url,thumbnail,release{id,title}}',
  };

  const response = await callVndbApi<VisualNovel>('vn', requestBody);
  return response.results.length > 0 ? response.results[0] : null;
};

export const searchTags = async (query: string): Promise<Tag[]> => {
  if (!query || query.length < 2) {
    return [];
  }
  const requestBody: ApiRequest = {
    filters: ['search', '=', query],
    fields: 'id, name, aliases, description, category',
    results: 10,
  };
  const response = await callVndbApi<Tag>('tag', requestBody);
  return response.results;
};
