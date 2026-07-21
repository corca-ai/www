import type { APIRoute } from 'astro';
import { SITE_ORIGIN } from '../site';

// Open every public page to search and AI crawlers. Only administration routes
// are excluded; the commented ASCII identity below has no crawler semantics.
export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL(SITE_ORIGIN)).href;
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /blog/admin
Disallow: /blog/admin/

Sitemap: ${base}sitemap.xml

#
#                                              .+.
#                                        .+omnNNNNh.
#                                     .yNMNNNNNMMMMN.
#                                  .+nMNNNNNMMMMMNNNN.
#                                .+MNNNNNMMMMMNNNNhMMm.
#                              .+NNNNNMMMMMNNNNm+::+nNd
#                            .+NNNNMMMMMNNNNN+.:::::.mN+
#                           +NNNh+mMMNNNNNM+.::::::::.MN
#                         .hNMn.   NNNNMM+.:::::::::::+N+
#                        +MMM+    +NMMMh.::::::::::::::nM.
#                       dMMM+    +MMMM+::::::::::::::::+M+
#                      oMNNd    +MMNh.::::::::::::::::::mn
#                     mNNNN+  .oNNNd::::::::::::::::::::oM.
#                    NNNMMMMdmNNNN+:::::::::::::::::::::+M+
#                   yMMMMMNNNNNMM+::::::::::::::::::::::+Ns
#                  dMMMNNNNNMMMM+:::::::::::::::::::::::.Ny
#                 +MNNNNNMMMMMN+:::::::::::::::::::::::::Mo
#                .NNNNMMMMMNNNd::::::::::::::::::::::::::N+
#                mNMMMMMNNNNNh::::::::::::::::::::::::::.Nd
#               +MMMMNNNNNMMM+::::::::::::::::::::::::::+Ms
#               nMNNNNNMMMMMm:::::::::::::::::::::::::::sMy
#              +NNNNMMMMMNNNNNhy+.::::::::::::::::::::::yNNm++
#      .-======hNMMMMMNNNNNMMMMMNNNm+.::::::::::::::::::mMMMMMN++
#   -=~~~~~~~~+MMMMNNNNNMMMMMNNNNNMMMMmo.::::::::::::::.MMMNNNNNMm+
# =~~~~~~~~~~~+MNNNNNMMMMMNNNNNMMMMMNNNNNmo.:::::::::::yNNNNNMMMMMNms       .=
# ~~~~~~~~====hNNNMMMMMNNNNNMMMMMNNNNNMMMMMNm.:::::::::NNNMMMMMNNNNNMh+..-=~~~
# ~~~=-. .....mMMMMMNNNNNMMMMMNNNNNMMMMMNNNNN+::::::::.MMMMMNNNNNMMMMMNy~~~~~~
# ~- .........MMMNNNNNMMMMMNNNNNMMMMMNNhmos+.-=========dhhmmnNmMMMMNNNNm~~~~~=
# ............hNNNNMMMMMNNNNNmNnyd++.~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~....~~~=-..
# ............+NMMMMmnNs+++..... ..---====~~~~~~~~~~~~~~~~~~~~~~~~~==--. .....
# .............+++.............................   ..........  ................
# ............................................................................
# ............................................................................
# ............................................................................
# ............................................................................
# ............................................................................
#
`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
