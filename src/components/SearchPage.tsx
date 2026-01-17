import { useState, useEffect } from 'react';
import { Search, Filter, X, MapPin, Calendar, Users, Star, Car, Wrench } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';

interface SearchPageProps {
  onNavigate?: (page: string) => void;
  initialQuery?: string;
}

// Mock data for search results
const mockSearchResults = {
  communities: [
    {
      id: '1',
      name: 'UAE Supercars',
      description: 'Premium supercars community in UAE',
      members: 1250,
      image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      verified: true,
      category: 'supercar'
    },
    {
      id: '2', 
      name: 'Dubai Car Shows',
      description: 'Car shows and events in Dubai',
      members: 890,
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop',
      verified: true,
      category: 'events'
    },
    {
      id: '3',
      name: 'JDM UAE',
      description: 'Japanese car enthusiasts in UAE',
      members: 650,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      verified: false,
      category: 'jdm'
    }
  ],
  marketplace: [
    {
      id: '1',
      title: 'BMW M4 Competition 2022',
      price: 285000,
      location: 'Dubai',
      mileage: '15,000 km',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
      featured: true,
      seller: 'Ahmed Hassan'
    },
    {
      id: '2',
      title: 'Mercedes AMG GT 63S',
      price: 420000,
      location: 'Abu Dhabi',
      mileage: '8,500 km',
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop',
      featured: false,
      seller: 'Omar Al Mansoori'
    }
  ],
  garages: [
    {
      id: '1',
      name: 'Elite Motors Service Center',
      rating: 4.8,
      reviews: 156,
      location: 'Dubai',
      services: ['Maintenance', 'Repairs', 'Tuning'],
      image: 'https://images.unsplash.com/photo-1632823469591-d1c937d14eb8?w=400&h=300&fit=crop',
      verified: true
    },
    {
      id: '2',
      name: 'Speed Performance Workshop', 
      rating: 4.6,
      reviews: 89,
      location: 'Sharjah',
      services: ['Performance', 'Dyno', 'ECU'],
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop',
      verified: false
    }
  ]
};

export function SearchPage({ onNavigate, initialQuery = '' }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    priceRange: [0, 500000],
    category: '',
    verified: false
  });

  const [filteredResults, setFilteredResults] = useState({
    communities: mockSearchResults.communities,
    marketplace: mockSearchResults.marketplace,
    garages: mockSearchResults.garages
  });

  useEffect(() => {
    handleSearch();
  }, [searchQuery, filters]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredResults(mockSearchResults);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    const filteredCommunities = mockSearchResults.communities.filter(community =>
      community.name.toLowerCase().includes(query) ||
      community.description.toLowerCase().includes(query) ||
      community.category.toLowerCase().includes(query)
    );

    const filteredMarketplace = mockSearchResults.marketplace.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.seller.toLowerCase().includes(query)
    );

    const filteredGarages = mockSearchResults.garages.filter(garage =>
      garage.name.toLowerCase().includes(query) ||
      garage.location.toLowerCase().includes(query) ||
      garage.services.some(service => service.toLowerCase().includes(query))
    );

    setFilteredResults({
      communities: filteredCommunities,
      marketplace: filteredMarketplace,
      garages: filteredGarages
    });
  };

  const getTotalResults = () => {
    return filteredResults.communities.length + 
           filteredResults.marketplace.length + 
           filteredResults.garages.length;
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      priceRange: [0, 500000],
      category: '',
      verified: false
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cars, communities, garages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden md:inline">Filters</span>
            </Button>
          </div>

          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              {getTotalResults()} results for "{searchQuery}"
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any location</SelectItem>
                        <SelectItem value="dubai">Dubai</SelectItem>
                        <SelectItem value="abu-dhabi">Abu Dhabi</SelectItem>
                        <SelectItem value="sharjah">Sharjah</SelectItem>
                        <SelectItem value="ajman">Ajman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Range (AED)</label>
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                      min={0}
                      max={500000}
                      step={10000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{filters.priceRange[0].toLocaleString()}</span>
                      <span>{filters.priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any category</SelectItem>
                        <SelectItem value="supercar">Supercars</SelectItem>
                        <SelectItem value="sports">Sports Cars</SelectItem>
                        <SelectItem value="luxury">Luxury Cars</SelectItem>
                        <SelectItem value="jdm">JDM</SelectItem>
                        <SelectItem value="classic">Classic Cars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={filters.verified}
                      onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                    />
                    <label htmlFor="verified" className="text-sm">Verified only</label>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({getTotalResults()})</TabsTrigger>
                <TabsTrigger value="communities">Communities ({filteredResults.communities.length})</TabsTrigger>
                <TabsTrigger value="marketplace">Marketplace ({filteredResults.marketplace.length})</TabsTrigger>
                <TabsTrigger value="garages">Garages ({filteredResults.garages.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6 space-y-6">
                {/* Communities Section */}
                {filteredResults.communities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Communities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredResults.communities.map((community) => (
                        <Card key={community.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                          <div className="relative">
                            <img 
                              src={community.image} 
                              alt={community.name}
                              className="w-full h-32 object-cover rounded-t-lg"
                            />
                            {community.verified && (
                              <Badge className="absolute top-2 right-2 bg-green-500">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-semibold">{community.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{community.description}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="mr-1 h-3 w-3" />
                              {community.members.toLocaleString()} members
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Marketplace Section */}
                {filteredResults.marketplace.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Car className="mr-2 h-5 w-5" />
                      Marketplace
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredResults.marketplace.map((item) => (
                        <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                          <div className="relative">
                            <img 
                              src={item.image} 
                              alt={item.title}
                              className="w-full h-32 object-cover rounded-t-lg"
                            />
                            {item.featured && (
                              <Badge className="absolute top-2 right-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-lg font-bold text-[var(--sublimes-gold)]">AED {item.price.toLocaleString()}</p>
                            <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                              <div className="flex items-center">
                                <MapPin className="mr-1 h-3 w-3" />
                                {item.location}
                              </div>
                              <span>{item.mileage}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Garages Section */}
                {filteredResults.garages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Wrench className="mr-2 h-5 w-5" />
                      Garages
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredResults.garages.map((garage) => (
                        <Card key={garage.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                          <div className="relative">
                            <img 
                              src={garage.image} 
                              alt={garage.name}
                              className="w-full h-32 object-cover rounded-t-lg"
                            />
                            {garage.verified && (
                              <Badge className="absolute top-2 right-2 bg-green-500">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-semibold">{garage.name}</h4>
                            <div className="flex items-center mb-2">
                              <div className="flex items-center mr-4">
                                <Star className="mr-1 h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-sm">{garage.rating}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">({garage.reviews} reviews)</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mb-2">
                              <MapPin className="mr-1 h-3 w-3" />
                              {garage.location}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {garage.services.map((service, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {getTotalResults() === 0 && (
                  <div className="text-center py-12">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="communities" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResults.communities.map((community) => (
                    <Card key={community.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img 
                          src={community.image} 
                          alt={community.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        {community.verified && (
                          <Badge className="absolute top-2 right-2 bg-green-500">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-lg">{community.name}</h4>
                        <p className="text-muted-foreground mb-3">{community.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-muted-foreground">
                            <Users className="mr-1 h-4 w-4" />
                            {community.members.toLocaleString()} members
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {community.category}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="marketplace" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResults.marketplace.map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        {item.featured && (
                          <Badge className="absolute top-2 right-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-lg">{item.title}</h4>
                        <p className="text-2xl font-bold text-[var(--sublimes-gold)] mb-2">AED {item.price.toLocaleString()}</p>
                        <div className="space-y-2">
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="mr-1 h-4 w-4" />
                            {item.location}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{item.mileage}</span>
                            <span className="text-sm text-muted-foreground">by {item.seller}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="garages" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredResults.garages.map((garage) => (
                    <Card key={garage.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img 
                          src={garage.image} 
                          alt={garage.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        {garage.verified && (
                          <Badge className="absolute top-2 right-2 bg-green-500">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-xl mb-2">{garage.name}</h4>
                        <div className="flex items-center mb-3">
                          <div className="flex items-center mr-6">
                            <Star className="mr-1 h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{garage.rating}</span>
                          </div>
                          <span className="text-muted-foreground">({garage.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center text-muted-foreground mb-4">
                          <MapPin className="mr-2 h-4 w-4" />
                          {garage.location}
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Services:</p>
                          <div className="flex flex-wrap gap-2">
                            {garage.services.map((service, index) => (
                              <Badge key={index} variant="outline">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}