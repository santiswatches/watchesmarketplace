import { onRequestPost as __api_auth_login_js_onRequestPost } from "C:\\Users\\20252128\\dev\\Projects\\santiwatches_webpage\\functions\\api\\auth\\login.js"
import { onRequestPost as __api_auth_logout_js_onRequestPost } from "C:\\Users\\20252128\\dev\\Projects\\santiwatches_webpage\\functions\\api\\auth\\logout.js"
import { onRequestGet as __api_auth_me_js_onRequestGet } from "C:\\Users\\20252128\\dev\\Projects\\santiwatches_webpage\\functions\\api\\auth\\me.js"
import { onRequestPost as __api_auth_register_js_onRequestPost } from "C:\\Users\\20252128\\dev\\Projects\\santiwatches_webpage\\functions\\api\\auth\\register.js"
import { onRequestGet as __api_watches__id__js_onRequestGet } from "C:\\Users\\20252128\\dev\\Projects\\santiwatches_webpage\\functions\\api\\watches\\[id].js"
import { onRequestPost as __api_orders_js_onRequestPost } from "C:\\Users\\20252128\\dev\\Projects\\santiwatches_webpage\\functions\\api\\orders.js"
import { onRequestGet as __api_watches_index_js_onRequestGet } from "C:\\Users\\20252128\\dev\\Projects\\santiwatches_webpage\\functions\\api\\watches\\index.js"

export const routes = [
    {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_js_onRequestPost],
    },
  {
      routePath: "/api/auth/logout",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_logout_js_onRequestPost],
    },
  {
      routePath: "/api/auth/me",
      mountPath: "/api/auth",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_me_js_onRequestGet],
    },
  {
      routePath: "/api/auth/register",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_register_js_onRequestPost],
    },
  {
      routePath: "/api/watches/:id",
      mountPath: "/api/watches",
      method: "GET",
      middlewares: [],
      modules: [__api_watches__id__js_onRequestGet],
    },
  {
      routePath: "/api/orders",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_orders_js_onRequestPost],
    },
  {
      routePath: "/api/watches",
      mountPath: "/api/watches",
      method: "GET",
      middlewares: [],
      modules: [__api_watches_index_js_onRequestGet],
    },
  ]