You need the following apache settings:

    Alias /stats <path-to-repo>/static
    ProxyPass /stats/proxy/search/list <search-url>/list
    Redirect /stats/proxy/search/ui <search-url>/ui
