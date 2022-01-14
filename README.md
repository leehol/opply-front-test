# Explanations
See below for (1) features and usage, (2) design choices, (3) improvements that could be made on the API

## Features and usage

### Features
Because I had relatively little time, I implemented a few key features: 
1. Search by postal code   
2. Specifying the number of results    
3. Marker indications on the breweries    
4. Click descriptions    
5. All brewery results    
6. Re-center and re-update breweries

### Usage
The default setting is to my home town postal code in the US. To use, simple insert a US postal code and the number of desired results

## Design choices

### Redux data store
While overkill, I just wanted to show that I am familiar with Redux state management patterns. I implemented async fetchers to the API via Redux and use axios for the get requests

### Ant Design components
Because I was told that Opply currently uses Ant Design, I also used it as a component library to implement a few views

### Inline CSS
Hypothetically, it is better convention to (a) spin out SCSS files and define global styles there... I did inline css because of lack of time, but for professional projects, I would highly recommend SCSS (styled-components) in separate spin-out files.

[See link here for example of scss](https://styled-components.com/)


### Pass props for visual states
We could have used Context (or Redux... there are many thoughts on this and many different camps of React beliefs...) for our view states; however, because there were not many layers, I decided to just pass props for the view states into child components

### String literals
In production code, string literals should never be found... in this case, I threw a few in because of time constraints as well. Ideally you would spin them out into a separate directory with all of your constants and your routes in one file (routes for the frontend app) and your APIs in another file (also so that you can spin out the host path between development and production code... e.g. localhost vs platform.opply.co or smth like that)

So ideally something like in a separate file called "api.js", you would have:
```
export const BREWERY_API = "https://api.openbrewerydb.org/breweries"
```

as the base API and export this out

### Errors
I borrowed a postal code => geolocation API by pinging a network request on a website and finding the endpoint that was requested to. With super bad practice, the key was exposed in the URL params, so I just fired off the API using this key. The API does not properly throw an error, but it returns a status value (-3) to indicate a value. As such, the "searchPostal" function in my code has to go along with their poor conventions...

### Challenges
1. I could have implemented pagination; however, due to time constraints, I did not. The pagination feature could have either been triggered via infinite scrolling (and triggering the API once you hit the end of the infinite scroll) or with a page number feature in the bottom, where a click to a new page would load new data.    
2. Furthermore, I could have implemented additional filters based on the API (by name, by type, by state); however, due to time constraints I skipped this feature. This would have looked like adding more fields in the form, marking some as optional, and parsing chunks of the parameter string based on what parameters were included to search on.    
3. Lastly, I could've broken into separate component files (which would be much cleaner convention and should be done). I skipped this also for the sake of a brief project and time.


### Improvements on the API

### Brewery sorting by area proximity
One thing that would be a nice to have is a sorting of breweries based on distance to the given location. This is not supported as a sort feature, although you could do that on the front end as well because the API does not sort for you.

### Breweries by post code
If you insert the geolocation for a postcode, then you get breweries in the proximity of a particular post code; however, if you enter a post code that does not have any breweries, then you get 0 results. I might add a parameter that is something like "exact" to allow for a search based on breweries EXACTLY in a specific post code or approximate search AROUND a specific post code.

Something like:
```
?by_postal=${postal_code}&exact=${bool_val}
```

### State abbreviation support
Most people use state abbreviations in the US. They're well known and commonplace... not having state abbreviation support for their search and returning with full state names is a bit absurd. They should have support to consume state abbreviations!!! Otherwise every time I write out a state with spaces, I have to url encode or add an underscore... bleh. 

So both:
```
by_state=california
```

and
```
by_state=CA
```

should work...

### Other than that, think about user centricity here and add a random brewery API
It'd be nice if there were an end point that just spat out a random brewery given a postal code or other location and maybe the other params (:
People like to discover new breweries in addition to old!



