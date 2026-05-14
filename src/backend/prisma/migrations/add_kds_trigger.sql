CREATE OR REPLACE FUNCTION notify_kds_order_change()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(
    'kds_' || NEW."tenantId",
    json_build_object(
      'type', TG_OP,
      'orderId', NEW.id,
      'status', NEW.status
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kds_order_change
AFTER INSERT OR UPDATE OF status ON "Order"
FOR EACH ROW EXECUTE FUNCTION notify_kds_order_change();
