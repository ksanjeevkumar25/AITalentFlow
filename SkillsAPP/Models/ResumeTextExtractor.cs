using System;
using System.IO;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using DocumentFormat.OpenXml.Packaging;
using System.Text;

namespace LoginApp.Helpers
{
    public static class ResumeTextExtractor
    {
        public static string ExtractText(string filePath)
        {
            var ext = Path.GetExtension(filePath).ToLowerInvariant();
            if (ext == ".pdf")
                return ExtractTextFromPdf(filePath);
            if (ext == ".docx")
                return ExtractTextFromDocx(filePath);
            throw new NotSupportedException($"File extension {ext} is not supported for text extraction.");
        }

        private static string ExtractTextFromPdf(string filePath)
        {
            var sb = new StringBuilder();
            using (var pdf = PdfDocument.Open(filePath))
            {
                foreach (Page page in pdf.GetPages())
                {
                    sb.AppendLine(page.Text);
                }
            }
            return sb.ToString();
        }

        private static string ExtractTextFromDocx(string filePath)
        {
            var sb = new StringBuilder();
            using (var doc = WordprocessingDocument.Open(filePath, false))
            {
                var body = doc.MainDocumentPart.Document.Body;
                sb.Append(body.InnerText);
            }
            return sb.ToString();
        }
    }
}
