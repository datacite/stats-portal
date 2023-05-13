###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false
page "/resolutions.html", :layout => "resolution"

# Reload the browser automatically whenever files change
configure :development do
  activate :livereload
end

# Load data
activate :data_source do |c|
  c.root = "#{ENV['CDN_URL']}/data"
  c.files = [
    "links.json"
  ]
end

# Set markdown template engine
set :markdown_engine, :pandoc
set :markdown, smartypants: true

###
# Helpers
###

# use asset host - we don't hash assets
# activate :asset_host, host: ENV['CDN_URL']

activate :dotenv

# Methods defined in the helpers block are available in templates
helpers do
  def stage?
    ENV['RACK_ENV'] == "stage"
  end

  def resolutions_array
     files = Dir["./source/stats/resolution-report/resolutions*.html"].map do |file| 
       { date: Date.strptime("#{file[-9..-6]}-#{file[-12..-11]}-01",'%Y-%m-%d'),  
           name: file[-24..-1],
           month: Date::MONTHNAMES[file[-12..-11].to_i],
           year: file[-9..-6],
        }
     end
     files.sort_by { |file| file[:date] }
  end
end

# Build-specific configuration
configure :build do
  # Minify CSS on build
  activate :minify_css

  # Minify Javascript on build
  activate :minify_javascript
end
