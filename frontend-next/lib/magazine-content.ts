/** Remove the obsolete WordPress flipbook shell while retaining the editorial article. */
export function magazineArticleContent(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<div\b[^>]*class=["'][^"']*\b_df_book\b[^"']*["'][^>]*>\s*<\/div\s*>/gi, "");
}
