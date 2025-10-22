import { DataProvider, fetchUtils } from 'react-admin'

const apiUrl = '/api'
const httpClient = fetchUtils.fetchJson

export default {
    getList: (resource) => {
        // Router skills vers /api/skills/all pour avoir une liste plate dans l'admin
        const endpoint = resource === 'skills' ? `${apiUrl}/skills/all` : `${apiUrl}/${resource}`
        return httpClient(endpoint).then(({ json }) => ({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: json.map((item: any) => ({ ...item, id: item._id || item.id })),
            total: json.length,
        }))
    },

    getOne: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
            data: { ...json, id: json._id },
        })),

    getMany: (resource, params) => {
        const query = params.ids.map((id) => `id=${id}`).join('&')
        return httpClient(`${apiUrl}/${resource}?${query}`).then(({ json }) => ({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: json.map((item: any) => ({ ...item, id: item._id })),
        }))
    },

    getManyReference: (resource) => {
        const url = `${apiUrl}/${resource}`
        return httpClient(url).then(({ json }) => ({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: json.map((item: any) => ({ ...item, id: item._id })),
            total: json.length,
        }))
    },

    create: (resource, params) =>
        httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({
            data: { ...json, id: json._id },
        })),

    update: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({
            data: { ...json, id: json._id },
        })),

    updateMany: (resource, params) => {
        return Promise.all(
            params.ids.map((id) =>
                httpClient(`${apiUrl}/${resource}/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(params.data),
                }),
            ),
        ).then((responses) => ({
            data: responses.map(({ json }) => json._id),
        }))
    },

    delete: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'DELETE',
        }).then(({ json }) => ({
            data: { ...json, id: params.id },
        })),

    deleteMany: (resource, params) => {
        return Promise.all(
            params.ids.map((id) =>
                httpClient(`${apiUrl}/${resource}/${id}`, {
                    method: 'DELETE',
                }),
            ),
        ).then(() => ({
            data: params.ids,
        }))
    },
} as DataProvider
