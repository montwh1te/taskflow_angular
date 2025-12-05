/**
 * Cloud Function para calcular o progresso de um projeto
 * 
 * Este arquivo deve ser copiado para: functions/src/index.ts
 * 
 * Setup:
 * 1. firebase init functions
 * 2. npm install --save firebase-admin
 * 3. Copiar este código para functions/src/index.ts
 * 4. firebase deploy --only functions
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function disparada quando uma tarefa é criada, atualizada ou deletada
 * Recalcula o progresso do projeto associado
 */
export const updateProjectProgress = functions.firestore
  .document("tasks/{taskId}")
  .onWrite(async (change, context) => {
    try {
      // Obter o documento da tarefa (antes e depois da mudança)
      const beforeData = change.before.exists ? change.before.data() : null;
      const afterData = change.after.exists ? change.after.data() : null;

      // Determinar o projectId (pode estar em antes ou depois)
      const projectId = afterData?.projectId || beforeData?.projectId;

      if (!projectId) {
        console.log("Nenhum projectId encontrado");
        return;
      }

      // Buscar todas as tarefas do projeto
      const tasksSnapshot = await db
        .collection("tasks")
        .where("projectId", "==", projectId)
        .get();

      let completedCount = 0;
      let totalCount = tasksSnapshot.size;

      // Contar tarefas concluídas
      tasksSnapshot.forEach((doc) => {
        const taskData = doc.data();
        if (taskData.status === "Concluído") {
          completedCount++;
        }
      });

      // Calcular progresso (0-100)
      const progress =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      // Atualizar o projeto com o novo progresso
      await db.collection("projects").doc(projectId).update({
        progress: progress,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `Projeto ${projectId} atualizado com progresso: ${progress}%`
      );
    } catch (error) {
      console.error("Erro ao atualizar progresso do projeto:", error);
      throw error;
    }
  });

/**
 * Cloud Function para limpar anexos quando uma tarefa é deletada
 * Remove todos os arquivos associados do Storage
 */
export const cleanupTaskAttachments = functions.firestore
  .document("tasks/{taskId}")
  .onDelete(async (snap, context) => {
    try {
      const taskId = context.params.taskId;
      const taskData = snap.data();
      const attachments = taskData?.attachments || [];

      if (attachments.length === 0) {
        return;
      }

      const bucket = admin.storage().bucket();

      // Deletar cada arquivo
      for (const attachment of attachments) {
        try {
          const filePath = `attachments/${taskId}/${attachment.fileName}`;
          await bucket.file(filePath).delete();
          console.log(`Arquivo deletado: ${filePath}`);
        } catch (err) {
          console.warn(
            `Erro ao deletar arquivo ${attachment.fileName}:`,
            err
          );
          // Continue mesmo se algum arquivo não puder ser deletado
        }
      }

      console.log(`Anexos da tarefa ${taskId} foram removidos`);
    } catch (error) {
      console.error("Erro ao limpar anexos da tarefa:", error);
      throw error;
    }
  });

/**
 * Cloud Function para validação de dados em tempo real
 * Garante que dados inválidos não sejam salvos
 */
export const validateTaskData = functions.firestore
  .document("tasks/{taskId}")
  .onCreate(async (snap, context) => {
    try {
      const taskData = snap.data();

      // Validações
      if (!taskData.title || taskData.title.trim().length === 0) {
        throw new Error("Título da tarefa é obrigatório");
      }

      if (!taskData.projectId) {
        throw new Error("ProjectId é obrigatório");
      }

      if (!taskData.status) {
        throw new Error("Status é obrigatório");
      }

      const validStatuses = ["A Fazer", "Em Andamento", "Concluído"];
      if (!validStatuses.includes(taskData.status)) {
        throw new Error("Status inválido");
      }

      console.log(`Tarefa ${context.params.taskId} validada com sucesso`);
    } catch (error) {
      console.error("Erro na validação da tarefa:", error);
      throw error;
    }
  });
