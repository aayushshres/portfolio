import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useSecretUnlock() {
  const navigate = useNavigate();

  useEffect(() => {
    let keySequence = "";
    const SECRET_CODE = "sudo"; // The secret word to type

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keypresses if the user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      keySequence += e.key;

      if (keySequence.includes(SECRET_CODE)) {
        navigate("/admin");
        keySequence = ""; // reset
      }

      // Keep the sequence length manageable
      if (keySequence.length > 20) {
        keySequence = keySequence.slice(-20);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
}
