// src/components/ConfirmDialog.jsx
import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function ConfirmDialog({
  show,
  title = "Confirmar",
  body = "¿Deseas continuar?",
  onCancel,
  onConfirm,
  confirmText = "Eliminar",
  confirmVariant = "danger",
  disableActions = false,
}) {
  return (
    <Modal show={show} onHide={onCancel} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={disableActions}>
          Cancelar
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={disableActions}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
