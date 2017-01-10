<!-- You need the following apache settings:

    Alias /stats <path-to-repo>/static
    ProxyPass /stats/proxy/search/list <search-url>/list
    Redirect /stats/proxy/search/ui <search-url>/ui -->

# DataCite Statistics Portal

Static website for DataCite summary statistics. This website provides summary statistics from all the datacenters that use DataCite DOIs. It includes DOIs registration and resolution.

## Installation

- middleman

```ruby
bundle install
```

## Usage

```ruby
bundle exec middleman
```
go to http://localhost:4567

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D
