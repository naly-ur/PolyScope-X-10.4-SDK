<% if (hasApplicationNode) { %>import { <%= applicationComponentName %>Component } from './application/<%= applicationNodeName %>.component';
<% } if (hasProgramNode) { %>import { <%= programComponentName %>Component } from './program/<%= programNodeName %>.component';<% } %>
