import type { Order } from "@/lib/types";
import styles from "./shipping-label.module.css";

export const SENDER = {
  name: "HANDPICKED BY MARIAM",
  lines: ["West Kadungalloor", "Aluva – 683110"],
  mobile: "9790744051",
};

type Receiver = Pick<Order, "customerName" | "address" | "city" | "state" | "pincode" | "mobile">;

export function ShippingLabel({ receiver }: { receiver: Receiver }) {
  return (
    <div className={styles.label}>
      <div className={styles.frame}>
        <div className={styles.title}>COURIER SHIPPING LABEL</div>

        <section className={styles.from}>
          <div className={styles.tag}>FROM</div>
          <div className={styles.senderName}>{SENDER.name}</div>
          {SENDER.lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
          <div>Mobile: {SENDER.mobile}</div>
        </section>

        <section className={styles.to}>
          <div>
            <div className={`${styles.tag} ${styles.tagSolid}`}>TO</div>
          </div>
          <div className={styles.toBody} data-fit>
            <div className={styles.receiverName}>{receiver.customerName}</div>
            <div className={styles.address}>{receiver.address}</div>
            {receiver.city && <div>{receiver.city}</div>}
            <div className={styles.statePin}>
              {receiver.state && <span>{receiver.state} –</span>}
              <span className={styles.pin}>{receiver.pincode}</span>
            </div>
            <div className={styles.mobile}>
              Mobile: <strong>{receiver.mobile}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export const labelPageClass = styles.a4Page;
