module.exports.Routes = {
  home: '/',
  login: '/auth/login',
  signup: '/auth/signup',
  properties: {
    base: '/property',
    me: '/property/me',
    bought: '/property/bought',
    id: (id) => `/property/${id}`
  },
  addProperty: '/property/add',
  updateProperty: (id) => `/property/update/${id}`
}