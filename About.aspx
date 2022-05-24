<%@ Page Title="Acerca del conversor | Conversor de texto a números" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="About.aspx.cs" Inherits="WebApplication4.About" %>
<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
    <div class="flex flex-row justify-center items-center w-screen h-screen">
        <div class="flex flex-col md:flex-row rounded-md container mx-auto border border-black shadow-sm py-4 md:justify-between items-center">
            <asp:Image runat="server" ID="ImagenAlexandru" AlternateText="El autor (Alexandru Robert Lazar) en su primer mes de prácticas curriculares" ImageUrl="~/Content/assets/Images/alexandru.png" CssClass="rounded-full w-2/4 md:w-1/4" />
            <div class="w-full md:w-2/4 mt-4 md:mt-0">
                <p class="texto-about">Esta obra se ha realizado en el marco de una beca de colaboración para el <b>Instituto Universitario de Análisis y Aplicaciones Textuales de la ULPGC</b>.
                Además, compone el <b>Trabajo de Fin de Grado</b> de d. <i>Alexandru Robert Lazar</i>.<br>
                Con este proyecto se pretenden dos cosas: facilitar el aprendizaje de los números, y hacer posible el procesamiento de los números que estén contenidos en textos.</p>
            </div>
        </div>
    </div>
</asp:Content>
