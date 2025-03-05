
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // AWS SES credentials
    const AWS_ACCESS_KEY_ID = Deno.env.get("AWS_ACCESS_KEY_ID");
    const AWS_SECRET_ACCESS_KEY = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    const MANAGER_EMAIL = Deno.env.get("MANAGER_EMAIL") || "yogeshh023@protonmail.com";

    // Get task data from request
    const { taskId, message } = await req.json();

    if (!taskId) {
      return new Response(
        JSON.stringify({ error: "Task ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get task data from database
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select(`
        *,
        assigned_user:profiles!tasks_assigned_to_fkey(name)
      `)
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      console.error("Error fetching task:", taskError);
      return new Response(
        JSON.stringify({ error: "Error fetching task data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create email client
    const client = new SmtpClient();

    try {
      await client.connectTLS({
        host: "email-smtp.us-east-1.amazonaws.com",
        port: 587,
        username: AWS_ACCESS_KEY_ID,
        password: AWS_SECRET_ACCESS_KEY,
      });

      const userName = task.assigned_user ? task.assigned_user.name : "A team member";
      
      // Send email
      await client.send({
        from: "DevTaskr <yogeshh023@protonmail.com>",
        to: MANAGER_EMAIL,
        subject: `Task Completed: ${task.title}`,
        content: `
          <html>
            <body>
              <h2>Task Completed</h2>
              <p><strong>Task:</strong> ${task.title}</p>
              <p><strong>Completed By:</strong> ${userName}</p>
              <p><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Description:</strong> ${task.description}</p>
              <p><strong>Message:</strong> ${message || "Task has been completed successfully."}</p>
            </body>
          </html>
        `,
        html: true,
      });

      await client.close();

      // Log the notification in our database
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          task_id: taskId,
          recipient_email: MANAGER_EMAIL,
          status: "sent",
          message: message || "Task has been completed successfully.",
        });

      if (notificationError) {
        console.error("Error logging notification:", notificationError);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Notification sent successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      
      // Log the failed notification
      await supabase
        .from("notifications")
        .insert({
          task_id: taskId,
          recipient_email: MANAGER_EMAIL,
          status: "failed",
          message: String(emailError),
        });
        
      return new Response(
        JSON.stringify({ error: "Failed to send email notification" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in send-task-notification function:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
