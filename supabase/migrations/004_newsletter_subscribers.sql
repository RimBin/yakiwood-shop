-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  consent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'pending')),
  source TEXT, -- footer, modal, popup, inline
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscribers(subscribed_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_user_id ON newsletter_subscribers(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER newsletter_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_updated_at();

-- Add RLS policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON newsletter_subscribers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can read all subscriptions
CREATE POLICY "Admins can read all subscriptions"
  ON newsletter_subscribers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Anyone can insert (for public signup)
CREATE POLICY "Anyone can insert subscription"
  ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own subscription
CREATE POLICY "Users can update own subscription"
  ON newsletter_subscribers
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Admins can update any subscription
CREATE POLICY "Admins can update any subscription"
  ON newsletter_subscribers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create unsubscribe function
CREATE OR REPLACE FUNCTION unsubscribe_newsletter(subscriber_email TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE newsletter_subscribers
  SET 
    status = 'unsubscribed',
    unsubscribed_at = NOW()
  WHERE email = subscriber_email
  AND status = 'active';

  IF FOUND THEN
    result := json_build_object(
      'success', true,
      'message', 'Successfully unsubscribed'
    );
  ELSE
    result := json_build_object(
      'success', false,
      'message', 'Subscription not found or already unsubscribed'
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create resubscribe function
CREATE OR REPLACE FUNCTION resubscribe_newsletter(subscriber_email TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE newsletter_subscribers
  SET 
    status = 'active',
    subscribed_at = NOW(),
    unsubscribed_at = NULL
  WHERE email = subscriber_email
  AND status = 'unsubscribed';

  IF FOUND THEN
    result := json_build_object(
      'success', true,
      'message', 'Successfully resubscribed'
    );
  ELSE
    result := json_build_object(
      'success', false,
      'message', 'Subscription not found or already active'
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE newsletter_subscribers IS 'Stores newsletter subscription data with GDPR compliance';
COMMENT ON COLUMN newsletter_subscribers.email IS 'Subscriber email address (unique)';
COMMENT ON COLUMN newsletter_subscribers.consent IS 'GDPR consent flag';
COMMENT ON COLUMN newsletter_subscribers.status IS 'Subscription status: active, unsubscribed, bounced, pending';
COMMENT ON COLUMN newsletter_subscribers.source IS 'Where the subscription originated from';
COMMENT ON COLUMN newsletter_subscribers.metadata IS 'Additional metadata (tags, preferences, etc.)';
