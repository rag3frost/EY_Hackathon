import edge_tts
import asyncio
import os
from typing import Optional

class VoiceSynthesizer:
    def __init__(self, voice: str = "en-IN-NeerjaNeural"):
        self.voice = voice  # Indian English voice

    async def synthesize_text(self, text: str, output_file: str) -> bool:
        try:
            communicate = edge_tts.Communicate(text, self.voice)
            await communicate.save(output_file)
            print(f"Voice synthesized and saved to {output_file}")
            return True
        except Exception as e:
            print(f"Error synthesizing voice: {e}")
            return False

    def generate_voice(self, text: str, output_file: str = "conversation.mp3") -> bool:
        """Synchronous wrapper for voice synthesis"""
        try:
            asyncio.run(self.synthesize_text(text, output_file))
            return True
        except Exception as e:
            print(f"Failed to generate voice: {e}")
            return False

    def generate_sample_conversation(self, conversation_text: str, filename: str = "sample_conversation.mp3"):
        """Generate voice for a full conversation transcript"""
        return self.generate_voice(conversation_text, filename)

# Example usage
if __name__ == "__main__":
    synthesizer = VoiceSynthesizer()
    sample_text = "Good morning Mr. Kumar! This is Maya from AutoCare AI. How are you today?"
    synthesizer.generate_voice(sample_text, "greeting.mp3")