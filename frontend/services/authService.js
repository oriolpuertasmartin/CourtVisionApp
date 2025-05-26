import API_BASE_URL from "../config/apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Clase de servicio para manejar todas las operaciones relacionadas con la autenticación
 */
class AuthService {
  /**
   * Iniciar sesión de usuario
   * @param {Object} credentials - Objeto con email y password
   * @returns {Promise<Object>} - Datos del usuario autenticado
   */
  async login(credentials) {
    // Realizar la petición de login al servidor
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    // Obtener los datos de la respuesta
    const data = await response.json();

    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      throw new Error(data.message || "Error en el inicio de sesión");
    }

    // Guardar el usuario en el almacenamiento local
    await this.saveUserToStorage(data);
    
    // Retornar los datos del usuario
    return data;
  }

  /**
   * Registrar un nuevo usuario
   * @param {Object} userData - Datos del usuario a registrar
   * @returns {Promise<Object>} - Datos del usuario registrado
   */
  async register(userData) {
    // Realizar la petición de registro al servidor
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    // Obtener los datos de la respuesta
    const data = await response.json();

    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      throw new Error(data.message || "Error en el registro");
    }

    // Retornar los datos del usuario registrado
    return data;
  }

  /**
   * Cerrar sesión de usuario
   * @returns {Promise<void>}
   */
  async logout() {
    // Eliminar el usuario del almacenamiento local
    await AsyncStorage.removeItem("user");
  }

  /**
   * Obtener el usuario actual desde el almacenamiento local
   * @returns {Promise<Object|null>} - Usuario actual o null si no hay ninguno
   */
  async getCurrentUser() {
    try {
      // Obtener el usuario del almacenamiento local
      const storedUser = await AsyncStorage.getItem("user");
      
      // Si existe un usuario almacenado, parsearlo y devolverlo
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error al obtener el usuario del almacenamiento:", error);
      return null;
    }
  }

  /**
   * Guardar el usuario en el almacenamiento local
   * @param {Object} user - Usuario a guardar
   * @returns {Promise<void>}
   */
  async saveUserToStorage(user) {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Error al guardar el usuario en el almacenamiento:", error);
    }
  }

  /**
   * Cambiar la contraseña del usuario
   * @param {string} userId - ID del usuario
   * @param {Object} passwordData - Objeto con currentPassword y newPassword
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async changePassword(userId, passwordData) {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al cambiar la contraseña");
    }

    return data;
  }

  /**
   * Actualizar el perfil del usuario
   * @param {string} userId - ID del usuario
   * @param {Object} userData - Datos actualizados del usuario
   * @returns {Promise<Object>} - Usuario actualizado
   */
  async updateProfile(userId, userData) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al actualizar el perfil");
    }

    // Actualizar el usuario en el almacenamiento local
    await this.saveUserToStorage(data);
    
    return data;
  }
}

// Exportar una instancia única del servicio
export default new AuthService();