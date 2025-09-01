import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, User, ArrowRight, TrendingUp, BookOpen, Heart, Target } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function BlogPage() {
  const featuredPost = {
    id: 1,
    title: "The Complete Guide to Career Transition in Tech Industry",
    excerpt:
      "Learn how to successfully transition your career into the tech industry with practical tips, resources, and real success stories from our mentors.",
    author: "Dr. Priya Sharma",
    date: "December 20, 2024",
    readTime: "12 min read",
    category: "Career Tips",
    image: "/placeholder.svg?height=400&width=600",
    featured: true,
  }

  const blogPosts = [
    {
      id: 2,
      title: "5 Essential Skills Every Software Engineer Should Master in 2025",
      excerpt: "Stay ahead in your software engineering career with these must-have skills for the upcoming year.",
      author: "Rahul Kumar",
      date: "December 18, 2024",
      readTime: "8 min read",
      category: "Career Tips",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      title: "Managing Stress and Anxiety During Job Search",
      excerpt: "Practical strategies to maintain mental wellness while navigating the challenging job search process.",
      author: "Dr. Meera Patel",
      date: "December 15, 2024",
      readTime: "6 min read",
      category: "Mental Wellness",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 4,
      title: "Building a Growth Mindset: Your Key to Success",
      excerpt: "Discover how developing a growth mindset can transform your approach to challenges and learning.",
      author: "Anjali Singh",
      date: "December 12, 2024",
      readTime: "10 min read",
      category: "Growth Mindset",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 5,
      title: "The Art of Networking: Building Professional Relationships",
      excerpt: "Learn effective networking strategies to build meaningful professional relationships in your industry.",
      author: "Vikash Patel",
      date: "December 10, 2024",
      readTime: "7 min read",
      category: "Career Tips",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 6,
      title: "Data Science Career Path: From Beginner to Expert",
      excerpt: "A comprehensive roadmap for aspiring data scientists with learning resources and career guidance.",
      author: "Dr. Rajesh Kumar",
      date: "December 8, 2024",
      readTime: "15 min read",
      category: "Career Tips",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 7,
      title: "Mindfulness Techniques for Better Focus and Productivity",
      excerpt: "Simple mindfulness practices that can help improve your focus and productivity at work.",
      author: "Dr. Meera Patel",
      date: "December 5, 2024",
      readTime: "5 min read",
      category: "Mental Wellness",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  const categories = [
    { name: "All Categories", count: 25, icon: BookOpen },
    { name: "Career Tips", count: 12, icon: Target },
    { name: "Mental Wellness", count: 8, icon: Heart },
    { name: "Growth Mindset", count: 5, icon: TrendingUp },
  ]

  const popularTags = [
    "Career Change",
    "Interview Tips",
    "Resume Building",
    "Stress Management",
    "Skill Development",
    "Networking",
    "Work-Life Balance",
    "Leadership",
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Knowledge Hub</h1>
            <p className="text-xl mb-8 opacity-90">
              Expert insights, career tips, and growth strategies from our mentors and industry professionals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input placeholder="Search articles..." className="pl-10 bg-white text-gray-900" />
              </div>
              <Button variant="secondary" className="px-6">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Post */}
        <section className="mb-12">
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="relative h-64 lg:h-auto">
                <Image
                  src={featuredPost.image || "/placeholder.svg"}
                  alt={featuredPost.title}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-purple-600">Featured</Badge>
              </div>
              <div className="p-8">
                <Badge variant="outline" className="mb-3">
                  {featuredPost.category}
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{featuredPost.title}</h2>
                <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{featuredPost.date}</span>
                  </div>
                  <span>{featuredPost.readTime}</span>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Read Full Article
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Select defaultValue="recent">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="career">Career Tips</SelectItem>
                  <SelectItem value="wellness">Mental Wellness</SelectItem>
                  <SelectItem value="growth">Growth Mindset</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className="p-6">
                    <Badge variant="outline" className="mb-3">
                      {post.category}
                    </Badge>
                    <h3 className="text-lg font-semibold mb-3 line-clamp-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{post.readTime}</span>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <Link href={`/blog/${post.id}`} className="flex items-center gap-1">
                          Read More
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" className="bg-transparent">
                Load More Articles
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <category.icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs cursor-pointer hover:bg-gray-100">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter Signup */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stay Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Get the latest career tips and insights delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <Input placeholder="Enter your email" type="email" />
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Subscribe</Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {blogPosts.slice(0, 3).map((post) => (
                    <div key={post.id} className="flex gap-3">
                      <Image
                        src={post.image || "/placeholder.svg"}
                        alt={post.title}
                        width={60}
                        height={60}
                        className="rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium line-clamp-2 mb-1">{post.title}</h4>
                        <p className="text-xs text-gray-500">{post.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
