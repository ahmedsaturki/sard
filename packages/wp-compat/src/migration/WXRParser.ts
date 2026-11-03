/**
 * @module @sard-cms/wp-compat/migration/WXRParser
 * Parses WordPress WXR (WordPress eXtended RSS) export files
 */

import type { WXRExport, WXRChannel } from "./types.js";

export class WXRParser {
  /**
   * Parse WXR XML file
   */
  async parseWXR(xmlContent: string): Promise<WXRExport> {
    const { parseStringPromise } = await import("xml2js");
    
    try {
      const result = await parseStringPromise(xmlContent, {
        explicitArray: true,
        mergeAttrs: true,
        trim: true,
      });

      const rss = result.rss;
      if (!rss || !rss.channel) {
        throw new Error("Invalid WXR file: missing channel");
      }

      const channel = rss.channel[0];
      return {
        channel: this.parseChannel(channel),
      };
    } catch (error) {
      throw new Error("Failed to parse WXR: " + (error instanceof Error ? error.message : String(error)));
    }
  }

  private parseChannel(channel: any): WXRChannel {
    const wp = channel["wp:wxr_version"] ? {
      wxr_version: channel["wp:wxr_version"][0] || "1.0",
      base_site_url: channel["wp:base_site_url"]?.[0] || "",
      base_blog_url: channel["wp:base_blog_url"]?.[0] || "",
      authors: this.parseAuthors(channel),
      categories: this.parseCategories(channel),
      tags: this.parseTags(channel),
      terms: this.parseTerms(channel),
      posts: this.parsePosts(channel, "post"),
      pages: this.parsePosts(channel, "page"),
      attachments: this.parseAttachments(channel),
      comments: this.parseComments(channel),
    } : {
      wxr_version: "1.0",
      base_site_url: "",
      base_blog_url: "",
      authors: [],
      categories: [],
      tags: [],
      terms: [],
      posts: [],
      pages: [],
      attachments: [],
      comments: [],
    };

    return {
      title: channel.title?.[0] || "",
      link: channel.link?.[0] || "",
      description: channel.description?.[0] || "",
      pubDate: channel.pubDate?.[0] || "",
      language: channel.language?.[0] || "en",
      wp,
      items: this.parseItems(channel),
    };
  }

  private parseAuthors(channel: any): any[] {
    const authors = channel["wp:author"] || [];
    return authors.map((author: any) => ({
      login: author["wp:author_login"]?.[0] || "",
      email: author["wp:author_email"]?.[0] || "",
      display_name: author["wp:author_display_name"]?.[0] || "",
      first_name: author["wp:author_first_name"]?.[0] || "",
      last_name: author["wp:author_last_name"]?.[0] || "",
    }));
  }

  private parseCategories(channel: any): any[] {
    const cats = channel["wp:category"] || [];
    return cats.map((cat: any) => ({
      slug: cat["wp:cat_slug"]?.[0] || "",
      name: cat["wp:cat_name"]?.[0] || "",
      parent: cat["wp:cat_parent"]?.[0] || undefined,
      description: cat["wp:cat_description"]?.[0] || "",
    }));
  }

  private parseTags(channel: any): any[] {
    const tags = channel["wp:tag"] || [];
    return tags.map((tag: any) => ({
      slug: tag["wp:tag_slug"]?.[0] || "",
      name: tag["wp:tag_name"]?.[0] || "",
      description: tag["wp:tag_description"]?.[0] || "",
    }));
  }

  private parseTerms(channel: any): any[] {
    const terms = channel["wp:term"] || [];
    return terms.map((term: any) => ({
      slug: term["wp:term_slug"]?.[0] || "",
      name: term["wp:term_name"]?.[0] || "",
      taxonomy: term["wp:term_taxonomy"]?.[0] || "",
      parent: term["wp:term_parent"]?.[0] || undefined,
      description: term["wp:term_description"]?.[0] || "",
    }));
  }

  private parsePosts(channel: any, postType: string): any[] {
    const items = channel.item || [];
    return items
      .filter((item: any) => item["wp:post_type"]?.[0] === postType)
      .map((item: any) => this.parsePostItem(item));
  }

  private parsePostItem(item: any): any {
    return {
      id: parseInt(item["wp:post_id"]?.[0] || "0"),
      title: item.title?.[0] || "",
      link: item.link?.[0] || "",
      pubDate: item.pubDate?.[0] || "",
      creator: item["dc:creator"]?.[0] || "",
      guid: item.guid?.[0] || "",
      description: item.description?.[0] || "",
      content_encoded: item["content:encoded"]?.[0] || "",
      excerpt_encoded: item["excerpt:encoded"]?.[0] || "",
      post_date: item["wp:post_date"]?.[0] || "",
      post_date_gmt: item["wp:post_date_gmt"]?.[0] || "",
      comment_status: item["wp:comment_status"]?.[0] || "open",
      ping_status: item["wp:ping_status"]?.[0] || "open",
      post_name: item["wp:post_name"]?.[0] || "",
      status: item["wp:status"]?.[0] || "publish",
      post_parent: parseInt(item["wp:post_parent"]?.[0] || "0"),
      menu_order: parseInt(item["wp:menu_order"]?.[0] || "0"),
      post_type: item["wp:post_type"]?.[0] || "post",
      post_password: item["wp:post_password"]?.[0] || "",
      is_sticky: item["wp:is_sticky"]?.[0] === "1",
      categories: this.parseItemCategories(item),
      tags: this.parseItemTags(item),
      meta: this.parsePostMeta(item),
    };
  }

  private parseItemCategories(item: any): string[] {
    const cats = item.category || [];
    return cats
      .filter((c: any) => c["$"]?.domain === "category" || c.domain === "category")
      .map((c: any) => c["_"] || c);
  }

  private parseItemTags(item: any): string[] {
    const tags = item.category || [];
    return tags
      .filter((t: any) => t["$"]?.domain === "post_tag" || t.domain === "post_tag")
      .map((t: any) => t["_"] || t);
  }

  private parsePostMeta(item: any): any[] {
    const meta = item["wp:postmeta"] || [];
    return meta.map((m: any) => ({
      key: m["wp:meta_key"]?.[0] || "",
      value: m["wp:meta_value"]?.[0] || "",
    }));
  }

  private parseAttachments(channel: any): any[] {
    const items = channel.item || [];
    return items
      .filter((item: any) => item["wp:post_type"]?.[0] === "attachment")
      .map((item: any) => ({
        ...this.parsePostItem(item),
        attachment_url: item["wp:attachment_url"]?.[0] || "",
      }));
  }

  private parseComments(channel: any): any[] {
    const comments = channel["wp:comment"] || [];
    return comments.map((c: any) => ({
      id: parseInt(c["wp:comment_id"]?.[0] || "0"),
      author: c["wp:comment_author"]?.[0] || "",
      author_email: c["wp:comment_author_email"]?.[0] || "",
      author_url: c["wp:comment_author_url"]?.[0] || "",
      author_ip: c["wp:comment_author_IP"]?.[0] || "",
      date: c["wp:comment_date"]?.[0] || "",
      date_gmt: c["wp:comment_date_gmt"]?.[0] || "",
      content: c["wp:comment_content"]?.[0] || "",
      approved: c["wp:comment_approved"]?.[0] || "1",
      type: c["wp:comment_type"]?.[0] || "comment",
      parent: parseInt(c["wp:comment_parent"]?.[0] || "0"),
      user_id: parseInt(c["wp:comment_user_id"]?.[0] || "0"),
      post_id: parseInt(c["wp:comment_post_ID"]?.[0] || "0"),
    }));
  }

  private parseItems(channel: any): any[] {
    const items = channel.item || [];
    return items.map((item: any) => ({
      title: item.title?.[0] || "",
      link: item.link?.[0] || "",
      pubDate: item.pubDate?.[0] || "",
      creator: item["dc:creator"]?.[0] || "",
      guid: item.guid?.[0] || "",
      description: item.description?.[0] || "",
      content: item["content:encoded"]?.[0] || "",
      postType: item["wp:post_type"]?.[0] || "post",
      status: item["wp:status"]?.[0] || "publish",
    }));
  }
}

