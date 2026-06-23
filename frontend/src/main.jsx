import React, { useMemo, useState } from "react"
import { createRoot } from "react-dom/client"
import {
  Check,
  Clipboard,
  Download,
  FileText,
  Languages,
  Loader2,
  PenLine,
  Sparkles,
} from "lucide-react"
import "./styles.css"
import { Badge } from "./components/ui/badge"
import { Button } from "./components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select"
import { Separator } from "./components/ui/separator"
import { Textarea } from "./components/ui/textarea"

const languages = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "french", label: "French" },
]

function renderMarkdown(markdown) {
  if (!markdown) {
    return <p className="text-muted-foreground">Your generated blog will appear here.</p>
  }

  return markdown.split(/\n{2,}/).map((block, index) => {
    const trimmed = block.trim()
    if (!trimmed) return null

    if (trimmed.startsWith("### ")) {
      return <h3 key={index}>{trimmed.slice(4)}</h3>
    }

    if (trimmed.startsWith("## ")) {
      return <h2 key={index}>{trimmed.slice(3)}</h2>
    }

    if (trimmed.startsWith("# ")) {
      return <h1 key={index}>{trimmed.slice(2)}</h1>
    }

    if (/^[-*]\s/m.test(trimmed)) {
      return (
        <ul key={index}>
          {trimmed.split(/\n/).map((item, itemIndex) => (
            <li key={itemIndex}>{item.replace(/^[-*]\s/, "")}</li>
          ))}
        </ul>
      )
    }

    return <p key={index}>{trimmed.replace(/\n/g, " ")}</p>
  })
}

function App() {
  const [topic, setTopic] = useState("")
  const [language, setLanguage] = useState("english")
  const [blog, setBlog] = useState(null)
  const [status, setStatus] = useState("Ready")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const markdown = useMemo(() => {
    if (!blog) return ""
    return `# ${blog.title || "Untitled draft"}\n\n${blog.content || ""}`
  }, [blog])

  const selectedLanguage = languages.find((item) => item.value === language)?.label || "English"

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setCopied(false)

    if (!topic.trim()) {
      setError("Add a topic before generating.")
      setStatus("Needs topic")
      return
    }

    setIsLoading(true)
    setStatus("Generating draft")

    try {
      let body_cont;

if (language === "english") {
  body_cont = JSON.stringify({
    topic: topic.trim(),
  });
} else {
  body_cont = JSON.stringify({
    topic: topic.trim(),
    language,
  });
}
      const response = await fetch("/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body_cont,
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Unable to generate a draft.")
      }

      setBlog(result.data.blog)
      setStatus("Draft ready")
    } catch (requestError) {
      setError(requestError.message)
      setStatus("Generation failed")
    } finally {
      setIsLoading(false)
    }
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setStatus("Copied to clipboard")
  }

  function downloadDraft() {
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "intelliblog-draft.md"
    link.click()
    URL.revokeObjectURL(url)
    setStatus("Markdown downloaded")
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-0 p-3 md:grid-cols-[380px_minmax(0,1fr)] md:p-6">
        <Card className="rounded-b-none border-b-0 md:rounded-r-none md:rounded-bl-lg md:border-b md:border-r-0">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-md bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl">IntelliBlog</CardTitle>
                <CardDescription>AI blog studio</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <FileText className="mr-1 h-3.5 w-3.5" />
                Markdown
              </Badge>
              <Badge variant="outline">
                <Languages className="mr-1 h-3.5 w-3.5" />
                {selectedLanguage}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form className="grid gap-5" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="topic">Topic</Label>
                <Textarea
                  id="topic"
                  maxLength={220}
                  placeholder="Agentic AI for product teams"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Select id="language" value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedLanguage} />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((item) => (
                      <SelectItem key={item.label} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
                Generate
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="grid gap-3">
              <Label htmlFor="status">Status</Label>
              <Input id="status" readOnly value={status} className={error ? "border-destructive" : ""} />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-t-none md:rounded-l-none md:rounded-tr-lg">
          <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardDescription>Draft</CardDescription>
              <CardTitle className="mt-1 break-words text-2xl md:text-3xl">
                {blog?.title || "Start a new article"}
              </CardTitle>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="icon" type="button" onClick={copyDraft} disabled={!blog} title="Copy draft">
                {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={downloadDraft}
                disabled={!blog}
                title="Download Markdown"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <article className={`prose-panel ${blog ? "" : "empty"}`}>{renderMarkdown(blog?.content || "")}</article>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

createRoot(document.getElementById("root")).render(<App />)
